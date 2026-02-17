package com.ecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {
    @NotEmpty
    private List<OrderItemRequest> items;

    @NotBlank
    private String shippingAddress;

    @NotBlank
    private String shippingCity;

    private String shippingPostalCode;

    @NotBlank
    private String shippingCountry;

    @NotNull
    private String paymentProvider; // STRIPE or MPESA

    private String phoneNumber; // For M-Pesa

    @Data
    public static class OrderItemRequest {
        @NotNull
        private Long productId;

        @NotNull
        private Integer quantity;
    }
}
