package com.ecommerce.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStats {
    private long totalProducts;
    private long totalOrders;
    private long activeProducts;
    private long lowStockProducts;
    private long pendingOrders;
    private double averageRating;
    private double orderSuccessRate;
    private long pendingReviewsCount;
}
