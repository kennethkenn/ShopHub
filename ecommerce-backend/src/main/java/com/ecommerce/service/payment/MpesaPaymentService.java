package com.ecommerce.service.payment;

import com.ecommerce.model.Order;
import com.ecommerce.model.Payment;
import com.ecommerce.model.enums.OrderStatus;
import com.ecommerce.model.enums.PaymentProvider;
import com.ecommerce.model.enums.PaymentStatus;
import com.ecommerce.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MpesaPaymentService {

    private final PaymentRepository paymentRepository;

    @Value("${payment.mpesa.consumer-key}")
    private String consumerKey;

    @Value("${payment.mpesa.consumer-secret}")
    private String consumerSecret;

    @Value("${payment.mpesa.shortcode}")
    private String shortcode;

    @Value("${payment.mpesa.passkey}")
    private String passkey;

    @Value("${payment.mpesa.callback-url}")
    private String callbackUrl;

    @Value("${payment.mpesa.environment}")
    private String environment;

    public Map<String, String> initiateSTKPush(Order order, String phoneNumber) {
        try {
            String accessToken = getAccessToken();
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
            String password = Base64.getEncoder().encodeToString(
                    (shortcode + passkey + timestamp).getBytes(StandardCharsets.UTF_8));

            String url = environment.equals("production")
                    ? "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
                    : "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

            Map<String, Object> payload = new HashMap<>();
            payload.put("BusinessShortCode", shortcode);
            payload.put("Password", password);
            payload.put("Timestamp", timestamp);
            payload.put("TransactionType", "CustomerPayBillOnline");
            payload.put("Amount", order.getTotalAmount().intValue());
            payload.put("PartyA", phoneNumber);
            payload.put("PartyB", shortcode);
            payload.put("PhoneNumber", phoneNumber);
            payload.put("CallBackURL", callbackUrl);
            payload.put("AccountReference", order.getOrderNumber());
            payload.put("TransactionDesc", "Payment for Order #" + order.getOrderNumber());

            // Make HTTP request (simplified - in production, use proper JSON serialization)
            String checkoutRequestId = UUID.randomUUID().toString(); // Simulated

            // Save payment record
            Payment payment = Payment.builder()
                    .order(order)
                    .provider(PaymentProvider.MPESA)
                    .amount(order.getTotalAmount())
                    .status(PaymentStatus.PENDING)
                    .mpesaCheckoutId(checkoutRequestId)
                    .build();

            paymentRepository.save(payment);

            Map<String, String> response = new HashMap<>();
            response.put("checkoutRequestId", checkoutRequestId);
            response.put("message", "STK Push sent to " + phoneNumber);

            return response;

        } catch (Exception e) {
            throw new RuntimeException("Failed to initiate M-Pesa payment: " + e.getMessage());
        }
    }

    public void handleCallback(Map<String, Object> callbackData) {
        Map<String, Object> stkCallback = extractStkCallback(callbackData);

        String checkoutRequestId = readString(stkCallback, "CheckoutRequestID");
        String resultCode = readString(stkCallback, "ResultCode");
        String resultDesc = readString(stkCallback, "ResultDesc");
        String receiptNumber = extractReceiptNumber(stkCallback);

        if (checkoutRequestId == null || checkoutRequestId.isBlank()) {
            throw new RuntimeException("CheckoutRequestID not found in callback payload");
        }

        Payment payment = paymentRepository.findByMpesaCheckoutId(checkoutRequestId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if ("0".equals(resultCode)) {
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setTransactionId(receiptNumber);
            payment.getOrder().setStatus(OrderStatus.CONFIRMED);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setErrorMessage(resultDesc != null ? resultDesc : "M-Pesa payment failed");
            payment.getOrder().setStatus(OrderStatus.CANCELLED);
        }

        paymentRepository.save(payment);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> extractStkCallback(Map<String, Object> callbackData) {
        Object body = callbackData.get("Body");
        if (body instanceof Map<?, ?> bodyMap) {
            Object stk = ((Map<String, Object>) bodyMap).get("stkCallback");
            if (stk instanceof Map<?, ?> stkMap) {
                return (Map<String, Object>) stkMap;
            }
        }

        Object directStk = callbackData.get("stkCallback");
        if (directStk instanceof Map<?, ?> stkMap) {
            return (Map<String, Object>) stkMap;
        }

        return callbackData;
    }

    private String readString(Map<String, Object> data, String key) {
        Object value = data.get(key);
        return value == null ? null : String.valueOf(value);
    }

    @SuppressWarnings("unchecked")
    private String extractReceiptNumber(Map<String, Object> stkCallback) {
        Object callbackMetadata = stkCallback.get("CallbackMetadata");
        if (!(callbackMetadata instanceof Map<?, ?> metadataMap)) {
            return null;
        }

        Object items = ((Map<String, Object>) metadataMap).get("Item");
        if (!(items instanceof List<?> itemList)) {
            return null;
        }

        for (Object item : itemList) {
            if (!(item instanceof Map<?, ?> itemMap)) {
                continue;
            }

            String name = String.valueOf(((Map<String, Object>) itemMap).get("Name"));
            if ("MpesaReceiptNumber".equals(name)) {
                Object value = ((Map<String, Object>) itemMap).get("Value");
                return value == null ? null : String.valueOf(value);
            }
        }

        return null;
    }

    private String getAccessToken() {
        // Simplified - in production, implement proper OAuth token retrieval
        return "simulated_access_token";
    }
}
