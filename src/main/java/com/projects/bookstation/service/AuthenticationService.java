package com.projects.bookstation.service;

import com.projects.bookstation.dto.AuthenticationRequest;
import com.projects.bookstation.dto.AuthenticationResponse;
import com.projects.bookstation.dto.EmailTemplateName;
import com.projects.bookstation.dto.RegistrationRequest;
import com.projects.bookstation.entity.Token;
import com.projects.bookstation.entity.User;
import com.projects.bookstation.excption.ActivationCodeExpiredException;
import com.projects.bookstation.repository.RoleRepository;
import com.projects.bookstation.repository.TokenRepository;
import com.projects.bookstation.repository.UserRepository;
import com.projects.bookstation.security.JwtService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthenticationService {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenRepository tokenRepository;
    private final EmailService emailService;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    @Value("${app.mailing.frontend.activation-url}")
    private String activationUrl;

    public void register(RegistrationRequest request) throws MessagingException {
        var userRole = roleRepository.findByRole("USER")
                .orElseThrow(() -> new IllegalStateException("User role not found"));

        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .accountLocked(false)
                .enabled(false)
                .roles(List.of(userRole))
                .build();

        userRepository.save(user);
        sendValidationEmail(user);
    }

    public void sendValidationEmail(User user) throws MessagingException {
        String activationCode = generateAndSaveActivationToken(user);
         emailService.sendEmail(
                user.getEmail(),
                user.getFullName(),
                EmailTemplateName.ACTIVATE_ACCOUNT,
                activationUrl,
                activationCode,
                "Account Activation");
    }

    private String generateAndSaveActivationToken(User user) {
        String activationCode = generateActivationCode(6);
        var token = Token.builder()
                .token(activationCode)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .user(user)
                .build();
        System.out.println(token);
        tokenRepository.save(token);
        return activationCode;
    }

    private String generateActivationCode(int length){
        String characters = "0123456789";
        StringBuilder activationCode = new StringBuilder();
        for (int i = 0; i < length; i++) {
            int index = (int) (Math.random() * characters.length());
            activationCode.append(characters.charAt(index));
        }
        return activationCode.toString();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        var auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var claims = new HashMap<String, Object>();
        var user = ((User)auth.getPrincipal());
        claims.put("fullName", user.getFullName());
        var jwtToken = jwtService.generateToken(claims, user);
        return AuthenticationResponse
                .builder()
                .token(jwtToken)
                .build();
    }

    public void activateCode(String token) throws MessagingException {
        log.info("Attempting to activate account with token: {}", token);

        var storedToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> {
                    log.warn("Invalid activation code provided: {}", token);
                    return new IllegalStateException("Invalid activation code");
                });

        log.debug("Token found: id={}, userId={}, expiresAt={}",
                storedToken.getId(),
                storedToken.getUser().getId(),
                storedToken.getExpiresAt());

        var user = userRepository.findById(storedToken.getUser().getId())
                .orElseThrow(() -> {
                    log.error("User not found for token: {}", token);
                    return new ActivationCodeExpiredException("User not found");
                });
        System.out.println("Activating user: " + user);

        if (storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("Activation code expired for userId={}. Sending new code...",
                    storedToken.getUser().getId());

            System.out.println("Sending new activation code to user: " + storedToken.getUser());
            sendValidationEmail(user);
            throw new IllegalStateException("Activation code has expired. A new code has been sent.");
        }

        log.info("Activating user account with id={}, email={}", user.getId(), user.getEmail());

        user.setEnabled(true);
        userRepository.save(user);

        storedToken.setValidatedAt(LocalDateTime.now());
        tokenRepository.save(storedToken);

        log.info("Activation successful for userId={}", user.getId());
    }
}
