package com.sliit.paf;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class SmartCampusApplication {

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(SmartCampusApplication.class);
        String portEnv = System.getenv("PORT");
        if (portEnv != null && !portEnv.isBlank()) {
            app.setDefaultProperties(java.util.Map.of("server.port", portEnv));
            System.out.println("Using PORT from environment: " + portEnv);
        }

        var context = app.run(args);
        var actualPort = context.getEnvironment().getProperty("local.server.port");
        System.out.println("SmartCampus running on port: " + actualPort);
    }
    
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*");
            }
        };
    }
}
