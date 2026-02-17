package com.ecommerce.service.payment;

import com.ecommerce.model.Order;
import com.ecommerce.model.Payment;
import com.ecommerce.model.enums.PaymentProvider;
import com.ecommerce.model.enums.PaymentStatus;
import com.ecommerce.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StripePaymentService {

    private final PaymentRepository paymentRepository;

    @Value("${payment.stripe.api-key}")
    private String stripeApiKey;

    public Map<String, String> createPaymentIntent(Order order) {
        // Development fallback for placeholder keys so checkout still works locally.
        if (stripeApiKey == null || stripeApiKey.isBlank() || stripeApiKey.startsWith("sk_test_your_stripe_key")) {
            String simulatedIntentId = "pi_demo_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

            Payment payment = Payment.builder()
                    .order(order)
                    .provider(PaymentProvider.STRIPE)
                    .amount(order.getTotalAmount())
                    .status(PaymentStatus.PENDING)
                    .paymentIntentId(simulatedIntentId)
                    .build();

            paymentRepository.save(payment);

            Map<String, String> response = new HashMap<>();
            response.put("paymentIntentId", simulatedIntentId);
            response.put("checkoutUrl", "/orders");
            response.put("mode", "demo");
            return response;
        }

        Stripe.apiKey = stripeApiKey;

        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(order.getTotalAmount().multiply(java.math.BigDecimal.valueOf(100)).longValue()) // Convert
                                                                                                               // to
                                                                                                               // cents
                    .setCurrency("usd")
                    .setDescription("Order #" + order.getOrderNumber())
                    .putMetadata("orderId", order.getId().toString())
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);

            // Save payment record
            Payment payment = Payment.builder()
                    .order(order)
                    .provider(PaymentProvider.STRIPE)
                    .amount(order.getTotalAmount())
                    .status(PaymentStatus.PENDING)
                    .paymentIntentId(intent.getId())
                    .build();

            paymentRepository.save(payment);

            Map<String, String> response = new HashMap<>();
            response.put("clientSecret", intent.getClientSecret());
            response.put("paymentIntentId", intent.getId());

            return response;

        } catch (StripeException e) {
            throw new RuntimeException("Failed to create payment intent: " + e.getMessage());
        }
    }

    public void confirmPayment(String paymentIntentId) {
        Payment payment = paymentRepository.findByPaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setTransactionId(paymentIntentId);
        paymentRepository.save(payment);
    }

    public void handleFailedPayment(String paymentIntentId, String errorMessage) {
        Payment payment = paymentRepository.findByPaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus(PaymentStatus.FAILED);
        payment.setErrorMessage(errorMessage);
        paymentRepository.save(payment);
    }
}
