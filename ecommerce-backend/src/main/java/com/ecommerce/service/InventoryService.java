package com.ecommerce.service;

import com.ecommerce.exception.ProductNotFoundException;
import com.ecommerce.model.InventoryLog;
import com.ecommerce.model.Product;
import com.ecommerce.repository.InventoryLogRepository;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final ProductRepository productRepository;
    private final InventoryLogRepository inventoryLogRepository;

    @Transactional
    public void decreaseStock(Long productId, Integer quantity, String reason, String changedBy) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        int previousQuantity = product.getStockQuantity();
        product.decreaseStock(quantity);
        productRepository.save(product);

        // Log the change
        InventoryLog log = InventoryLog.builder()
                .product(product)
                .quantityChange(-quantity)
                .previousQuantity(previousQuantity)
                .newQuantity(product.getStockQuantity())
                .reason(reason)
                .changedBy(changedBy)
                .build();

        inventoryLogRepository.save(log);
    }

    @Transactional
    public void increaseStock(Long productId, Integer quantity, String reason, String changedBy) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        int previousQuantity = product.getStockQuantity();
        product.increaseStock(quantity);
        productRepository.save(product);

        // Log the change
        InventoryLog log = InventoryLog.builder()
                .product(product)
                .quantityChange(quantity)
                .previousQuantity(previousQuantity)
                .newQuantity(product.getStockQuantity())
                .reason(reason)
                .changedBy(changedBy)
                .build();

        inventoryLogRepository.save(log);
    }

    public Page<InventoryLog> getInventoryHistory(Long productId, Pageable pageable) {
        return inventoryLogRepository.findByProductId(productId, pageable);
    }
}
