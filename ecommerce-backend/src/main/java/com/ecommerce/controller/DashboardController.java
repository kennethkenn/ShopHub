package com.ecommerce.controller;

import com.ecommerce.dto.response.DashboardStats;
import com.ecommerce.model.enums.OrderStatus;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        long totalProducts = productRepository.count();
        long activeProducts = productRepository.countByActiveTrue();
        long lowStockProducts = productRepository.countByStockQuantityLessThan(10); // Threshold of 10

        long totalOrders = orderRepository.count();
        long deliveredOrders = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING);

        Double averageRating = reviewRepository.getAverageRatingForApprovedReviews();
        if (averageRating == null) {
            averageRating = 0.0;
        }

        double successRate = 0.0;
        if (totalOrders > 0) {
            successRate = (double) deliveredOrders / totalOrders * 100;
        }

        // Format to 1 decimal place
        averageRating = Math.round(averageRating * 10.0) / 10.0;
        successRate = Math.round(successRate * 10.0) / 10.0;

        long pendingReviewsCount = reviewRepository.countByApprovedFalse();

        return ResponseEntity.ok(DashboardStats.builder()
                .totalProducts(totalProducts)
                .totalOrders(totalOrders)
                .activeProducts(activeProducts)
                .lowStockProducts(lowStockProducts)
                .pendingOrders(pendingOrders)
                .averageRating(averageRating)
                .orderSuccessRate(successRate)
                .pendingReviewsCount(pendingReviewsCount)
                .build());
    }
}
