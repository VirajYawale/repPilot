package repoPilot.backend.dto;


import repoPilot.backend.enums.IndexStatus;

import java.time.Instant;
import java.util.UUID;

public record IndexStatusResponse(
        UUID repositoryId,
        IndexStatus indexStatus,
        int filesTotal,
        long filesProcessed,
        int chunkCount,
        Instant indexedAt,
        String errorMessage) {
}