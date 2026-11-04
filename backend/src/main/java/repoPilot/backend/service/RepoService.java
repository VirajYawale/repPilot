
package repoPilot.backend.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import repoPilot.backend.dto.IndexStatusResponse;
import repoPilot.backend.dto.RepositoryResponse;
import repoPilot.backend.entity.Repository;
import repoPilot.backend.entity.User;
import repoPilot.backend.exceptions.NotFoundException;
import repoPilot.backend.repository.RepositoryRepository;
import repoPilot.backend.service.github.GithubApiClient;

@Service
@RequiredArgsConstructor
public class RepoService {

    private final RepositoryRepository repositoryRepository;
    private final UserService userService;
    private final GithubApiClient gitHubApiClient;

    @Transactional
    public List<RepositoryResponse> syncAndListRepos(UUID userId) {
        User user = userService.requiredById(userId);
        String token = userService.decryptAccessToken(user);

        List<Map<String, Object>> remoteRepos =
                gitHubApiClient.listUserRepos(token);

        List<Repository> saved = new ArrayList<>();

        for (Map<String, Object> remote : remoteRepos) {
            Object remoteId = remote.get("id");

            if (remoteId == null) {
                continue;
            }

            String githubRepoId = String.valueOf(remoteId);

            Repository repo = repositoryRepository
                    .findByUserIdAndGithubRepoId(userId, githubRepoId)
                    .orElseGet(Repository::new);

            String fullName = String.valueOf(remote.get("full_name"));
            String[] parts = fullName.split("/", 2);

            Object ownerObject = remote.get("owner");
            String ownerFromApi = null;

            if (ownerObject instanceof Map<?, ?> ownerMap) {
                Object login = ownerMap.get("login");
                if (login != null) {
                    ownerFromApi = String.valueOf(login);
                }
            } else if (ownerObject != null) {
                ownerFromApi = String.valueOf(ownerObject);
            }

            repo.setUserId(userId);
            repo.setGithubRepoId(githubRepoId);

            repo.setOwner(
                    parts.length > 0 && !parts[0].isBlank()
                            ? parts[0]
                            : ownerFromApi
            );

            repo.setName(
                    parts.length > 1
                            ? parts[1]
                            : String.valueOf(remote.get("name"))
            );

            repo.setFullName(fullName);

            Object defaultBranch = remote.get("default_branch");
            repo.setDefaultBranch(
                    defaultBranch != null
                            ? String.valueOf(defaultBranch)
                            : "main"
            );

            Object language = remote.get("language");
            repo.setLanguage(
                    language != null ? String.valueOf(language) : null
            );

            Object htmlUrl = remote.get("html_url");
            repo.setHtmlUrl(
                    htmlUrl != null ? String.valueOf(htmlUrl) : null
            );

            Object description = remote.get("description");
            repo.setDescription(
                    description != null
                            ? String.valueOf(description)
                            : null
            );

            repo.setUpdatedAt(Instant.now());

            saved.add(repositoryRepository.save(repo));
        }

        return saved.stream()
                .sorted((a, b) ->
                        a.getFullName().compareToIgnoreCase(b.getFullName()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RepositoryResponse> listStored(UUID userId) {
        return repositoryRepository
                .findByUserIdOrderByFullNameAsc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Repository requireOwned(UUID repoId, UUID userId) {
        return repositoryRepository
                .findByIdAndUserId(repoId, userId)
                .orElseThrow(() ->
                        new NotFoundException("Repository not found"));
    }

    @Transactional(readOnly = true)
    public IndexStatusResponse status(UUID repoId, UUID userId) {
        Repository repo = requireOwned(repoId, userId);

        return new IndexStatusResponse(
                repo.getId(),
                repo.getIndexStatus(),
                repo.getFileTotal(),
                repo.getTotalProcessed(),
                0,
                repo.getIndexedAt(),
                repo.getErrorMessage()
        );
    }

    public RepositoryResponse toResponse(Repository repo) {
        return new RepositoryResponse(
                repo.getId(),
                repo.getGithubRepoId(),
                repo.getOwner(),
                repo.getName(),
                repo.getFullName(),
                false,
                repo.getDefaultBranch(),
                repo.getLanguage(),
                repo.getHtmlUrl(),
                repo.getDescription(),
                repo.getIndexStatus(),
                repo.getIndexedAt(),
                0,
                repo.getFileTotal(),
                repo.getTotalProcessed(),
                repo.getErrorMessage()
        );
    }
}
