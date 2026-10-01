package com.example.buildpro.event;

import com.example.buildpro.model.User;
import com.example.buildpro.model.Wallet;
import com.example.buildpro.model.WalletTransaction;
import com.example.buildpro.repository.WalletRepository;
import com.example.buildpro.repository.WalletTransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * OrderEventListener — Async post-order side effect handler.
 *
 * Listens for OrderPlacedEvent and processes wallet cashback on
 * the "orderEventExecutor" thread pool, completely off the HTTP
 * request thread. This means checkout response reaches the user
 * immediately after order DB save, without waiting for wallet ops.
 */
@Component
public class OrderEventListener {

    private static final Logger logger = LoggerFactory.getLogger(OrderEventListener.class);

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private WalletTransactionRepository walletTransactionRepository;

    @Async("orderEventExecutor")
    @EventListener
    public void handleOrderPlaced(OrderPlacedEvent event) {
        User user = event.getUser();
        double discountAmount = event.getDiscountAmount();

        if (discountAmount <= 0) {
            return; // No cashback to apply
        }

        try {
            Wallet wallet = walletRepository.findByUser(user)
                    .orElseGet(() -> {
                        Wallet newWallet = new Wallet();
                        newWallet.setUser(user);
                        return walletRepository.save(newWallet);
                    });

            wallet.setBalance(wallet.getBalance() + discountAmount);
            walletRepository.save(wallet);

            WalletTransaction transaction = new WalletTransaction();
            transaction.setWallet(wallet);
            transaction.setAmount(discountAmount);
            transaction.setType(WalletTransaction.TransactionType.CREDIT);
            transaction.setDescription("Cluster discount cashback");
            walletTransactionRepository.save(transaction);

            logger.info("Cashback of ₹{} applied to wallet for user: {}", discountAmount, user.getId());

        } catch (Exception e) {
            logger.error("Failed to apply cashback for user {}: {}", user.getId(), e.getMessage(), e);
        }
    }
}
