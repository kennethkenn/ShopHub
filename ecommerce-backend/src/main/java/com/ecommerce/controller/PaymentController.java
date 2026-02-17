package com.ecommerce.controller;

import com.ecommerce.service.payment.MpesaPaymentService;
import com.ecommerce.service.payment.StripeWebhookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final MpesaPaymentService mpesaPaymentService;
    private final StripeWebhookService stripeWebhookService;

    @PostMapping("/mpesa/callback")
    public ResponseEntity<String> mpesaCallback(@RequestBody Map<String, Object> callbackData) {
        mpesaPaymentService.handleCallback(callbackData);
        return ResponseEntity.ok("Callback processed");
    }

    @PostMapping("/stripe/webhook")
    public ResponseEntity<String> stripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        stripeWebhookService.handleWebhook(payload, sigHeader);
        return ResponseEntity.ok("Webhook processed");
    }
}
