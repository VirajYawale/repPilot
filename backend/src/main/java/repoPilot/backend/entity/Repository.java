package repoPilot.backend.entity;


import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import repoPilot.backend.enums.IndexStatus;

@Entity
@Table(name = "repositories", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "github_repo_id" }))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Repository {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "github_repo_id", nullable = false)
    private String githubRepoId;

    @Column(name = "owner", nullable = false)
    private String owner;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "default_branch", nullable = false)
    private String defaultBranch;

    @Column(name = "language")
    private String language;

    @Column(name = "html_url", nullable = false)
    private String htmlUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "index_status", nullable = false, length = 20)
    @Builder.Default
    private IndexStatus indexStatus = IndexStatus.PENDING;

    @Column(name = "indexed_at")
    private Instant indexedAt;

    @Column(name = "check_count", nullable = false)
    @Builder.Default
    private int checkCount = 0;

    @Column(name = "file_total", nullable = false)
    @Builder.Default
    private int fileTotal = 0;

    @Column(name = "total_processed", nullable = false)
    @Builder.Default
    private long totalProcessed = 0;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }

        updatedAt = now;
        if (indexStatus == null) {
            indexStatus = IndexStatus.PENDING;
        }
    }
}
