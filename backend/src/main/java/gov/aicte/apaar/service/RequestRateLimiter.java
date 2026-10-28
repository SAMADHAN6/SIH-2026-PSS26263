package gov.aicte.apaar.service;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/** Basic per-process guard for unauthenticated credential/registration endpoints. */
@Service
public class RequestRateLimiter {
    private record Window(Instant startedAt, AtomicInteger count) {}

    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();
    private final AtomicInteger operations = new AtomicInteger();

    public boolean allow(String key, int maxRequests, Duration window) {
        Instant now = Instant.now();
        Window current = windows.compute(key, (ignored, previous) -> {
            if (previous == null || Duration.between(previous.startedAt(), now).compareTo(window) >= 0) {
                return new Window(now, new AtomicInteger(1));
            }
            previous.count().incrementAndGet();
            return previous;
        });

        if (operations.incrementAndGet() % 1024 == 0) {
            windows.entrySet().removeIf(e -> Duration.between(e.getValue().startedAt(), now)
                    .compareTo(Duration.ofHours(1)) >= 0);
        }
        return current.count().get() <= maxRequests;
    }
}
