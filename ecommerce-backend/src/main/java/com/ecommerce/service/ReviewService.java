package com.ecommerce.service;

import com.ecommerce.model.Product;
import com.ecommerce.model.Review;
import com.ecommerce.model.User;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.ReviewRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public Review createReview(Long productId, Integer rating, String comment) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if user already reviewed this product
        if (reviewRepository.findByUserIdAndProductId(user.getId(), productId).isPresent()) {
            throw new RuntimeException("You have already reviewed this product");
        }

        // Check if verified purchase
        boolean verifiedPurchase = orderRepository.hasPurchasedProduct(email, productId);

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(rating)
                .comment(comment)
                .verifiedPurchase(verifiedPurchase)
                .approved(false) // Requires admin approval
                .build();

        return reviewRepository.save(review);
    }

    public Page<Review> getProductReviews(Long productId, Pageable pageable) {
        return reviewRepository.findByProductIdAndApprovedTrue(productId, pageable);
    }

    public Page<Review> getPendingReviews(Pageable pageable) {
        return reviewRepository.findByApprovedFalse(pageable);
    }

    @Transactional
    public Review approveReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setApproved(true);
        return reviewRepository.save(review);
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        reviewRepository.deleteById(reviewId);
    }
}
