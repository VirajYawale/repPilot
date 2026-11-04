package repoPilot.backend.service.ai;

import java.util.List;
import java.util.UUID;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import repoPilot.backend.dto.ChatMessageResponse;
import repoPilot.backend.dto.CitationDto;
import repoPilot.backend.entity.ChatMessage;
import repoPilot.backend.entity.ChatSession;
import repoPilot.backend.enums.MessageRole;
import repoPilot.backend.repository.ChatMessageRepository;
import repoPilot.backend.repository.ChatSessionRepository;

/**
 * Generation step: call model via Spring AI ChatModel and stream tokens to the browser over SSE.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ChatStreamHandler {

    private final ChatModel chatModel;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final CitationMapper citationMapper;

    public SseEmitter stream(
            UUID sessionId,
            ChatMessageResponse savedUserMessage,
            List<CitationDto> citations,
            String systemPrompt,
            String userPrompt) {

        SseEmitter emitter = new SseEmitter(RagSettings.STREAM_TIMEOUT_MS);
        StringBuilder fullReply = new StringBuilder();

        try {
            emitter.send(SseEmitter.event()
                    .name("user_message")
                    .data(savedUserMessage));

            ChatClient.builder(chatModel)
                    .build()
                    .prompt()
                    .system(systemPrompt)
                    .user(userPrompt)
                    .stream()
                    .content()
                    .doOnNext(token -> appendToken(emitter, fullReply, token))
                    .doOnError(err -> {
                        log.error("Chat stream error", err);
                        emitter.completeWithError(err);
                    })
                    .doOnComplete(() -> completeStream(
                            emitter, sessionId, fullReply, citations))
                    .subscribe();
        } catch (Exception ex) {
            emitter.completeWithError(ex);
        }

        return emitter;
    }

    private void appendToken(SseEmitter emitter, StringBuilder fullReply, String token) {
        fullReply.append(token);
        try {
            emitter.send(SseEmitter.event()
                    .name("token")
                    .data(token, MediaType.APPLICATION_JSON));
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
    }

    private void completeStream(
            SseEmitter emitter,
            UUID sessionId,
            StringBuilder fullReply,
            List<CitationDto> citations) {
        try {
            ChatSession session = chatSessionRepository.findById(sessionId)
                    .orElseThrow(() -> new IllegalStateException("Session not found: " + sessionId));

            ChatMessage assistant = chatMessageRepository.save(ChatMessage.builder()
                    .session(session)
                    .role(MessageRole.ASSISTANT.name())
                    .content(fullReply.toString())
                    .citationsJson(citationMapper.toJson(citations))
                    .build());

            emitter.send(SseEmitter.event()
                    .name("assistant_message")
                    .data(toMessageResponse(assistant)));
            emitter.send(SseEmitter.event().name("done").data("[DONE]"));
            emitter.complete();
        } catch (Exception ex) {
            emitter.completeWithError(ex);
        }
    }

    private ChatMessageResponse toMessageResponse(ChatMessage message) {
        MessageRole role = MessageRole.valueOf(message.getRole());
        return new ChatMessageResponse(
                message.getId(),
                role,
                message.getContent(),
                citationMapper.fromJson(message.getCitationsJson()),
                message.getCreatedAt());
    }
}
