package com.ecommerce.controller;

import com.ecommerce.dto.request.CreateOrderRequest;
import com.ecommerce.model.Order;
import com.ecommerce.service.OrderService;
import com.ecommerce.service.payment.MpesaPaymentService;
import com.ecommerce.service.payment.StripePaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final StripePaymentService stripePaymentService;
    private final MpesaPaymentService mpesaPaymentService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        Order order = orderService.createOrder(request);

        // Initiate payment based on provider
        Map<String, String> paymentData;
        if ("STRIPE".equals(request.getPaymentProvider())) {
            paymentData = stripePaymentService.createPaymentIntent(order);
        } else if ("MPESA".equals(request.getPaymentProvider())) {
            paymentData = mpesaPaymentService.initiateSTKPush(order, request.getPhoneNumber());
        } else {
            throw new RuntimeException("Invalid payment provider");
        }

        return ResponseEntity.ok(Map.of(
                "order", order,
                "payment", paymentData));
    }

    @GetMapping
    public ResponseEntity<Page<Order>> getUserOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(orderService.getUserOrders(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/check-purchase/{productId}")
    public ResponseEntity<Boolean> checkPurchase(@PathVariable Long productId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(orderService.hasPurchasedProduct(email, productId));
    }
}
