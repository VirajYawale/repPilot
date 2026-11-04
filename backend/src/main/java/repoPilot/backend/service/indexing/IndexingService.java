
package repoPilot.backend.service.indexing;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import repoPilot.backend.entity.Repository;
import repoPilot.backend.enums.IndexStatus;
import repoPilot.backend.exceptions.BadRequestException;
import repoPilot.backend.exceptions.NotFoundException;
import repoPilot.backend.repository.RepositoryRepository;
import repoPilot.backend.service.UserService;
import repoPilot.backend.service.github.GitHubRateLimiter;
import repoPilot.backend.service.github.GithubApiClient;
import repoPilot.backend.service.ai.RagSettings;

@Service
@RequiredArgsConstructor
@Slf4j
public class IndexingService {

    private static final int VECTOR_BATCH_SIZE = 32;
    private static final int PROGRESS_EVERY_N_FILES = 5;

    private final RepositoryRepository repositoryRepository;
    private final UserService userService;
    private final GithubApiClient gitHubApiClient;
    private final CodeFileFilter fileFilter;
    private final CodeChunker codeChunker;
    private final GitHubRateLimiter rateLimiter;
    private final VectorStore vectorStore;

    @Value("${app.indexing.max-file-bytes:102400}")
    private long maxFileBytes;

    @Transactional
    public Repository startIndexing(UUID repoId, UUID userId) {

        Repository repo = repositoryRepository
                .findByIdAndUserId(repoId, userId)
                .orElseThrow(() ->
                        new NotFoundException("Repository not found")
                );

        if (repo.getIndexStatus() == IndexStatus.INDEXING) {
            throw new BadRequestException(
                    "Repository is already being indexed"
            );
        }

        repo.setIndexStatus(IndexStatus.INDEXING);
        repo.setTotalProcessed(0);
        repo.setFileTotal(0);
        repo.setCheckCount(0);
        repo.setIndexedAt(null);
        repo.setErrorMessage(null);
        repo.setUpdatedAt(Instant.now());

        return repositoryRepository.save(repo);
    }

    @Async("indexingExecutor")
    public void indexAsync(UUID repoId, UUID userId) {

        try {
            log.info("Starting indexing for repository {}", repoId);

            doIndex(repoId, userId);

        } catch (Exception ex) {

            log.error(
                    "Indexing failed for repository {}",
                    repoId,
                    ex
            );

            markFailed(repoId, ex.getMessage());
        }
    }

    private void doIndex(UUID repoId, UUID userId) {

        Repository repo = repositoryRepository.findById(repoId)
                .orElseThrow(() ->
                        new NotFoundException("Repository not found")
                );

        String token = userService.decryptAccessToken(
                userService.requiredById(userId)
        );

        deleteExistingVectors(repoId.toString());

        Map<String, Object> tree = gitHubApiClient.getRepoTree(
                token,
                repo.getOwner(),
                repo.getName(),
                repo.getDefaultBranch()
        );

        List<String> filePaths = listIndexableFiles(tree);

        log.info(
                "Found {} indexable files in {}",
                filePaths.size(),
                repo.getFullName()
        );

        updateProgress(
                repoId,
                filePaths.size(),
                0,
                0,
                IndexStatus.INDEXING,
                null
        );

        List<Document> batch = new ArrayList<>();

        int processed = 0;
        int totalChunks = 0;
        int successfulFiles = 0;

        for (String path : filePaths) {

            try {

                String content = gitHubApiClient.getFileContent(
                        token,
                        repo.getOwner(),
                        repo.getName(),
                        path
                );

                List<Document> chunks = codeChunker.chunkFile(
                        repoId.toString(),
                        path,
                        content
                );

                batch.addAll(chunks);

                totalChunks += chunks.size();
                successfulFiles++;

                if (batch.size() >= VECTOR_BATCH_SIZE) {
                    vectorStore.add(new ArrayList<>(batch));
                    batch.clear();
                }

            } catch (Exception ex) {

                log.warn(
                        "Skipping file {} in {}: {}",
                        path,
                        repo.getFullName(),
                        ex.getMessage()
                );
            }

            processed++;

            if (processed % PROGRESS_EVERY_N_FILES == 0
                    || processed == filePaths.size()) {

                updateProgress(
                        repoId,
                        filePaths.size(),
                        processed,
                        totalChunks,
                        IndexStatus.INDEXING,
                        null
                );
            }

            rateLimiter.pause();
        }

        if (!batch.isEmpty()) {
            vectorStore.add(new ArrayList<>(batch));
            batch.clear();
        }

        if (!filePaths.isEmpty() && successfulFiles == 0) {
            throw new IllegalStateException(
                    "Indexing failed: no files could be processed"
            );
        }

        if (!filePaths.isEmpty() && totalChunks == 0) {
            throw new IllegalStateException(
                    "Indexing produced no document chunks"
            );
        }

        markReady(
                repoId,
                filePaths.size(),
                processed,
                totalChunks,
                repo.getFullName()
        );
    }

    @SuppressWarnings("unchecked")
    private List<String> listIndexableFiles(
            Map<String, Object> tree) {

        if (tree == null || tree.get("tree") == null) {
            return List.of();
        }

        List<Map<String, Object>> entries =
                (List<Map<String, Object>>) tree.get("tree");

        return entries.stream()
                .filter(entry ->
                        "blob".equals(
                                String.valueOf(entry.get("type"))
                        )
                )
                .filter(entry -> {

                    String path = String.valueOf(
                            entry.get("path")
                    );

                    long size =
                            entry.get("size") instanceof Number n
                                    ? n.longValue()
                                    : 0L;

                    return fileFilter.isEligible(
                            path,
                            size,
                            maxFileBytes
                    );
                })
                .map(entry ->
                        String.valueOf(entry.get("path"))
                )
                .toList();
    }

    private void deleteExistingVectors(String repoId) {

        try {

            var filter = new FilterExpressionBuilder()
                    .eq(RagSettings.METADATA_REPO_ID, repoId)
                    .build();

            vectorStore.delete(filter);

        } catch (Exception ex) {

            log.warn(
                    "Could not delete existing vectors for repo {}: {}",
                    repoId,
                    ex.getMessage()
            );
        }
    }

    @Transactional
    protected void updateProgress(
            UUID repoId,
            int total,
            int processed,
            int chunks,
            IndexStatus status,
            String error) {

        repositoryRepository.findById(repoId)
                .ifPresent(repo -> {

                    repo.setFileTotal(total);
                    repo.setTotalProcessed(processed);
                    repo.setCheckCount(chunks);
                    repo.setIndexStatus(status);
                    repo.setErrorMessage(error);
                    repo.setUpdatedAt(Instant.now());

                    repositoryRepository.save(repo);
                });
    }

    @Transactional
    protected void markReady(
            UUID repoId,
            int totalFiles,
            int processedFiles,
            int totalChunks,
            String fullName) {

        repositoryRepository.findById(repoId)
                .ifPresent(repo -> {

                    // Important: ChatService expects READY.
                    repo.setIndexStatus(IndexStatus.READY);

                    repo.setFileTotal(totalFiles);
                    repo.setTotalProcessed(processedFiles);
                    repo.setCheckCount(totalChunks);

                    repo.setIndexedAt(Instant.now());
                    repo.setErrorMessage(null);
                    repo.setUpdatedAt(Instant.now());

                    repositoryRepository.save(repo);
                });

        log.info(
                "Repository READY: {} | Files: {} | Chunks: {}",
                fullName,
                processedFiles,
                totalChunks
        );
    }

    @Transactional
    protected void markFailed(
            UUID repoId,
            String message) {

        repositoryRepository.findById(repoId)
                .ifPresent(repo -> {

                    repo.setIndexStatus(IndexStatus.FAILED);

                    repo.setErrorMessage(
                            message != null && message.length() > 2000
                                    ? message.substring(0, 2000)
                                    : message
                    );

                    repo.setUpdatedAt(Instant.now());

                    repositoryRepository.save(repo);
                });
    }
}
