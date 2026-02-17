package com.ecommerce.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class SecurityValidationConfig {

    @Value("${spring.security.jwt.secret}")
    private String jwtSecret;

    @Value("${payment.stripe.api-key}")
    private String stripeApiKey;

    @Value("${payment.mpesa.consumer-key}")
    private String mpesaConsumerKey;

    @PostConstruct
    public void validateConfiguration() {
        log.info("Validating security configuration...");

        // Validate JWT secret
        if (jwtSecret == null || jwtSecret.contains("change-this") || jwtSecret.length() < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET must be set and be at least 32 characters long. " +
                            "Current value is insecure or missing.");
        }

        // Validate Stripe configuration
        if (stripeApiKey == null || stripeApiKey.contains("your_stripe_key")) {
            log.warn("STRIPE_SECRET_KEY is not properly configured. Stripe payments will not work.");
        }

        // Validate M-Pesa configuration
        if (mpesaConsumerKey == null || mpesaConsumerKey.contains("your_consumer_key")) {
            log.warn("MPESA_CONSUMER_KEY is not properly configured. M-Pesa payments will not work.");
        }

        log.info("Security configuration validation complete.");
    }
}
