package repoPilot.backend.repository;


import java.util.UUID;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import repoPilot.backend.entity.ChatMessage;


public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(UUID sessionId);
}