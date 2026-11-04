package repoPilot.backend.repository;


import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepositoryRepository extends JpaRepository<repoPilot.backend.entity.Repository, UUID> {
    List<repoPilot.backend.entity.Repository> findByUserIdOrderByFullNameAsc(UUID userId);

    Optional<repoPilot.backend.entity.Repository> findByIdAndUserId(UUID id, UUID userId);

    // Note: Changed Long to String to match the githubRepoId type in the Repository entity
    Optional<repoPilot.backend.entity.Repository> findByUserIdAndGithubRepoId(UUID userId, String githubRepoId);
}
