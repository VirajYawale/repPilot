
package repoPilot.backend.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import lombok.RequiredArgsConstructor;
import repoPilot.backend.dto.ChatMessageResponse;
import repoPilot.backend.dto.ChatSessionResponse;
import repoPilot.backend.dto.CreateChatSessionRequest;
import repoPilot.backend.entity.ChatMessage;
import repoPilot.backend.entity.ChatSession;
import repoPilot.backend.entity.Repository;
import repoPilot.backend.entity.User;
import repoPilot.backend.enums.IndexStatus;
import repoPilot.backend.enums.MessageRole;
import repoPilot.backend.exceptions.BadRequestException;
import repoPilot.backend.exceptions.NotFoundException;
import repoPilot.backend.repository.ChatMessageRepository;
import repoPilot.backend.repository.ChatSessionRepository;
import repoPilot.backend.service.ai.ChatPromptBuilder;
import repoPilot.backend.service.ai.ChatStreamHandler;
import repoPilot.backend.service.ai.CitationMapper;
import repoPilot.backend.service.ai.CodeContextRetriever;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final RepoService repoService;
    private final UserService userService;
    private final CodeContextRetriever codeContextRetriever;
    private final ChatPromptBuilder chatPromptBuilder;
    private final ChatStreamHandler chatStreamHandler;
    private final CitationMapper citationMapper;

    @Transactional
    public ChatSessionResponse createSession(
            UUID userId,
            CreateChatSessionRequest request) {

        if (request == null || request.repositoryId() == null) {
            throw new BadRequestException(
                    "Repository ID is required to create a chat session"
            );
        }

        Repository repo = repoService.requireOwned(
                request.repositoryId(),
                userId
        );

        ensureRepositoryReady(repo);

        User user = userService.requiredById(userId);

        String title = request.title() != null
                && !request.title().isBlank()
                ? request.title().trim()
                : "Chat with " + repo.getFullName();

        ChatSession session = ChatSession.builder()
                .user(user)
                .repository(repo)
                .title(title)
                .build();

        ChatSession savedSession =
                chatSessionRepository.save(session);

        return toSessionResponse(savedSession);
    }

    @Transactional(readOnly = true)
    public List<ChatSessionResponse> listSessions(
            UUID userId,
            UUID repositoryId) {

        if (repositoryId == null) {
            throw new BadRequestException(
                    "Repository ID is required"
            );
        }

        repoService.requireOwned(repositoryId, userId);

        return chatSessionRepository
                .findByUserIdAndRepositoryIdOrderByCreatedAtDesc(
                        userId,
                        repositoryId
                )
                .stream()
                .map(this::toSessionResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(
            UUID userId,
            UUID sessionId) {

        ChatSession session = requireSession(userId, sessionId);

        return chatMessageRepository
                .findBySessionIdOrderByCreatedAtAsc(session.getId())
                .stream()
                .map(this::toMessageResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ChatSession requireSession(
            UUID userId,
            UUID sessionId) {

        return chatSessionRepository
                .findByIdAndUserId(sessionId, userId)
                .orElseThrow(() ->
                        new NotFoundException("Chat session not found")
                );
    }

    public SseEmitter streamReply(
            UUID userId,
            UUID sessionId,
            String userContent) {

        ChatSession session = requireSession(userId, sessionId);

        Repository repo = repoService.requireOwned(
                session.getRepository().getId(),
                userId
        );

        ensureRepositoryReady(repo);

        if (userContent == null || userContent.isBlank()) {
            throw new BadRequestException(
                    "Message content cannot be empty"
            );
        }

        ChatMessage userMessage = chatMessageRepository.save(
                ChatMessage.builder()
                        .session(session)
                        .role(MessageRole.USER.name())
                        .content(userContent.trim())
                        .build()
        );

        var retrievedContext = codeContextRetriever.retrieve(
                repo.getId(),
                userContent.trim()
        );

        String systemPrompt =
                chatPromptBuilder.systemPrompt(repo.getFullName());

        String userPrompt = chatPromptBuilder.userPrompt(
                retrievedContext.contextText(),
                userContent.trim()
        );

        return chatStreamHandler.stream(
                session.getId(),
                toMessageResponse(userMessage),
                retrievedContext.citations(),
                systemPrompt,
                userPrompt
        );
    }

    private void ensureRepositoryReady(Repository repo) {
        if (repo.getIndexStatus() != IndexStatus.READY) {
            String status = repo.getIndexStatus() == null
                    ? "UNKNOWN"
                    : repo.getIndexStatus().name();

            String message;

            switch (status) {
                case "PENDING" ->
                        message = "Repository indexing has not started yet.";
                case "INDEXING" ->
                        message = "Repository is still indexing. Please wait until indexing completes.";
                case "FAILED" ->
                        message = "Repository indexing failed. Please retry indexing.";
                default ->
                        message = "Repository is not ready for chat. Current status: "
                                + status;
            }

            throw new BadRequestException(message);
        }
    }

    private ChatSessionResponse toSessionResponse(
            ChatSession session) {

        return new ChatSessionResponse(
                session.getId(),
                session.getRepository().getId(),
                session.getTitle(),
                session.getCreatedAt()
        );
    }

    private ChatMessageResponse toMessageResponse(
            ChatMessage message) {

        MessageRole role = MessageRole.valueOf(message.getRole());

        return new ChatMessageResponse(
                message.getId(),
                role,
                message.getContent(),
                citationMapper.fromJson(message.getCitationsJson()),
                message.getCreatedAt()
        );
    }
}
