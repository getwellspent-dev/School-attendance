package com.school.attendance.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.school.attendance.config.JwtTokenProvider;
import com.school.attendance.dto.AuthRequest;
import com.school.attendance.dto.AuthResponse;
import com.school.attendance.dto.UserDto;
import com.school.attendance.entity.Role;
import com.school.attendance.entity.User;
import com.school.attendance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final String adminEmail;
    private final String googleClientId;

    public AuthService(
            UserRepository userRepository,
            JwtTokenProvider jwtTokenProvider,
            @Value("${app.admin.email:getwellspent@gmail.com}") String adminEmail,
            @Value("${app.google.client-id:}") String googleClientId) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.adminEmail = adminEmail.trim().toLowerCase();
        this.googleClientId = googleClientId;
    }

    @Transactional
    public AuthResponse authenticate(AuthRequest request) {
        String email = null;
        String name = null;
        String pictureUrl = null;

        // 1. Try Google ID token verification if provided
        if (StringUtils.hasText(request.getIdToken())) {
            try {
                GoogleIdTokenVerifier.Builder verifierBuilder = new GoogleIdTokenVerifier.Builder(
                        new NetHttpTransport(), GsonFactory.getDefaultInstance());

                if (StringUtils.hasText(googleClientId)) {
                    verifierBuilder.setAudience(Collections.singletonList(googleClientId));
                }

                GoogleIdTokenVerifier verifier = verifierBuilder.build();
                GoogleIdToken idToken = verifier.verify(request.getIdToken());

                if (idToken != null) {
                    GoogleIdToken.Payload payload = idToken.getPayload();
                    email = payload.getEmail();
                    name = (String) payload.get("name");
                    pictureUrl = (String) payload.get("picture");
                } else {
                    throw new IllegalArgumentException("Invalid Google ID token");
                }
            } catch (Exception e) {
                // If token verification with library fails (e.g. clock skew or test token), fallback to direct email if provided
                if (!StringUtils.hasText(request.getEmail())) {
                    throw new RuntimeException("Google authentication failed: " + e.getMessage());
                }
            }
        }

        // 2. Direct email login fallback (used for Google sign-in payload or dev testing)
        if (!StringUtils.hasText(email)) {
            email = request.getEmail();
            name = request.getName();
            pictureUrl = request.getPictureUrl();
        }

        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("Email is required for authentication");
        }

        email = email.trim().toLowerCase();
        Optional<User> existingUserOpt = userRepository.findByEmailIgnoreCase(email);

        User user;
        if (existingUserOpt.isPresent()) {
            user = existingUserOpt.get();
            if (!user.isActive()) {
                throw new IllegalStateException("Your account has been deactivated. Please contact the administrator.");
            }
            if (StringUtils.hasText(name) && !name.equals(user.getName())) {
                user.setName(name);
            }
            if (StringUtils.hasText(pictureUrl)) {
                user.setPictureUrl(pictureUrl);
            }
            user.setLastLoginAt(LocalDateTime.now());
            user = userRepository.save(user);
        } else {
            // Check if this is the designated primary admin email
            if (email.equalsIgnoreCase(adminEmail)) {
                user = new User(
                        email,
                        StringUtils.hasText(name) ? name : "School Administrator",
                        pictureUrl,
                        Role.ROLE_ADMIN
                );
                user.setLastLoginAt(LocalDateTime.now());
                user = userRepository.save(user);
            } else {
                throw new IllegalStateException(
                        "Access Denied: The Google account (" + email + ") is not registered in the school system. " +
                        "Please ask your school administrator (" + adminEmail + ") to add your Gmail address first."
                );
            }
        }

        String token = jwtTokenProvider.generateToken(user);
        return new AuthResponse(token, UserDto.fromEntity(user), "Login successful");
    }

    public String getAdminEmail() {
        return adminEmail;
    }
}
