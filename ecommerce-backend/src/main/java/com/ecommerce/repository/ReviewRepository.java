package com.ecommerce.repository;

import com.ecommerce.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByProductIdAndApprovedTrue(Long productId, Pageable pageable);

    Page<Review> findByApprovedFalse(Pageable pageable);

    Optional<Review> findByUserIdAndProductId(Long userId, Long productId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId AND r.approved = true")
    Double getAverageRatingForProduct(@Param("productId") Long productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId AND r.approved = true")
    Long countApprovedReviewsForProduct(@Param("productId") Long productId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.approved = true")
    Double getAverageRatingForApprovedReviews();

    long countByApprovedFalse();
}
