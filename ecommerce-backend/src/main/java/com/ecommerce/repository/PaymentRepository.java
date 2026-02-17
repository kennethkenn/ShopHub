package com.ecommerce.repository;

import com.ecommerce.model.Payment;
import com.ecommerce.model.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(Long orderId);

    Optional<Payment> findByTransactionId(String transactionId);

    Optional<Payment> findByPaymentIntentId(String paymentIntentId);

    Optional<Payment> findByMpesaCheckoutId(String mpesaCheckoutId);

    Page<Payment> findByStatus(PaymentStatus status, Pageable pageable);

    List<Payment> findByStatusIn(List<PaymentStatus> statuses);
}
