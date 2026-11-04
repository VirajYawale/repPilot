package repoPilot.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.encrypt.TextEncryptor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import repoPilot.backend.entity.User;
import repoPilot.backend.repository.UserRepository;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    public final UserRepository userRepository;

    public final TextEncryptor tokenEncryptor;


    @Transactional(readOnly = true)
    public User requiredById(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional(readOnly = true)
    public String decryptAccessToken(User user) {
        return tokenEncryptor.decrypt(user.getAccessToken());
    }

    @Transactional
    public User upsertFromGithub(Map<String, Object> attributes, String accessToken, String tokenScope) {
        Long githubId = attributes.get("id") instanceof Integer id
                ? id.longValue()
                : ((Number) attributes.get("id")).longValue();

//        https://api.github.com/users/VirajYawale
        String login = (String) attributes.get("login");
        String name = (String) attributes.get("name");
        String avatarUrl = (String) attributes.get("avatar_url");
        String displayName = (name != null && !name.isBlank()) ? name : login;

        User user = userRepository.findByGithubId(githubId)
                .map(existingUser -> {
                    existingUser.setGithubUsername(login);
                    existingUser.setDisplayName(displayName);
                    existingUser.setAvatarUrl(avatarUrl);
                    existingUser.setAccessToken(tokenEncryptor.encrypt(accessToken));
                    existingUser.setTokenScopes(tokenScope);
                    return existingUser;
                })
                .orElseGet(() -> User.builder()
                        .githubId(githubId)
                        .githubUsername(login)
                        .displayName(displayName)
                        .avatarUrl(avatarUrl)
                        .accessToken(tokenEncryptor.encrypt(accessToken))
                        .tokenScopes(tokenScope)
                        .build());
        return userRepository.save(user);
    }

}
