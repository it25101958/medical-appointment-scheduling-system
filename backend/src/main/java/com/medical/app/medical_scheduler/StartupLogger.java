package com.medical.app.medical_scheduler;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class StartupLogger {

    private final Environment env;

    public StartupLogger(Environment env) {
        this.env = env;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        String port = env.getProperty("local.server.port",
                env.getProperty("server.port", "8080"));

        String contextPath = env.getProperty("server.servlet.context-path", "");
        if (!contextPath.startsWith("/") && !contextPath.isBlank()) contextPath = "/" + contextPath;

        System.out.println();
        System.out.println("Ready on http://localhost:" + port + contextPath);
        System.out.println();
    }
}
