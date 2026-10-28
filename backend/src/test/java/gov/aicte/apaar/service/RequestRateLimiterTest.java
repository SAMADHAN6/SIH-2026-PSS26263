package gov.aicte.apaar.service;

import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RequestRateLimiterTest {
    @Test
    void rejectsRequestsAfterConfiguredWindowLimit() {
        RequestRateLimiter limiter = new RequestRateLimiter();

        assertTrue(limiter.allow("login:127.0.0.1", 2, Duration.ofMinutes(1)));
        assertTrue(limiter.allow("login:127.0.0.1", 2, Duration.ofMinutes(1)));
        assertFalse(limiter.allow("login:127.0.0.1", 2, Duration.ofMinutes(1)));
    }
}
