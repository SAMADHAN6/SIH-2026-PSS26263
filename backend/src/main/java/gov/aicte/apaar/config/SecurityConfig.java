package gov.aicte.apaar.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.http.HttpMethod;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${app.cors.allowed-origins:*}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable))
            .authorizeHttpRequests(auth -> auth
                // Public API endpoints — no auth required
                .requestMatchers(HttpMethod.GET,
                        "/api/aicte/public-summary",
                        "/api/aicte/summary",
                        "/api/aicte/colleges",
                        "/api/aicte/duplicate-alerts",
                        "/api/aicte/logs",
                        "/api/aicte/export-excel",
                        "/api/college/stats",
                        "/api/college/students",
                        "/api/college/alerts",
                        "/api/verify/**").permitAll()
                .requestMatchers(HttpMethod.POST,
                        "/api/verify/*/status",
                        "/api/college/bulk-upload",
                        "/api/auth/college-login",
                        "/api/auth/google-login",
                        "/api/auth/admin-login",
                        "/api/auth/register",
                        "/api/auth/logout").permitAll()
                .requestMatchers(HttpMethod.PATCH,
                        "/api/aicte/colleges/*/status").permitAll()
                // Health check and OPTIONS preflight
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/actuator/health", "/actuator/**").permitAll()
                // Deny everything else
                .anyRequest().denyAll()
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Support wildcard '*' or comma-separated origins from APP_ALLOWED_ORIGINS
        if ("*".equals(allowedOrigins.trim())) {
            configuration.addAllowedOriginPattern("*");
        } else {
            List<String> origins = List.of(allowedOrigins.split(","))
                    .stream().map(String::trim).filter(o -> !o.isEmpty()).toList();
            configuration.setAllowedOrigins(origins);
        }

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
