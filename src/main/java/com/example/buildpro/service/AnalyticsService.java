package com.example.buildpro.service;

import com.example.buildpro.model.Category;
import com.example.buildpro.model.Product;
import com.example.buildpro.model.User;
import com.example.buildpro.model.analytics.ProductTrendingAnalytics;
import com.example.buildpro.model.analytics.UserCategoryPreference;
import com.example.buildpro.repository.CategoryRepository;
import com.example.buildpro.repository.ProductRepository;
import com.example.buildpro.repository.analytics.ProductTrendingAnalyticsRepository;
import com.example.buildpro.repository.analytics.UserCategoryPreferenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private UserCategoryPreferenceRepository userCategoryPreferenceRepository;

    @Autowired
    private ProductTrendingAnalyticsRepository productTrendingAnalyticsRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    // ─── In-memory cache for the sorted trending product feed ───────────────
    // Refreshed every 5 minutes by refreshTrendingCache().
    // volatile ensures all threads see the latest reference immediately.
    private volatile List<Product> cachedTrendingFeed = Collections.emptyList();
    private volatile Map<Long, Integer> cachedRankMap = Collections.emptyMap();

    /**
     * Retrieves the latest category preference for a given user.
     */
    public Optional<UserCategoryPreference> getUserCategoryPreference(User user) {
        if (user == null || user.getId() == null) {
            return Optional.empty();
        }
        try {
            return userCategoryPreferenceRepository.findFirstByUserIdOrderByCalculatedAtDesc(user.getId());
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    /**
     * Retrieves top trending product analytics ordered by rank.
     */
    public List<ProductTrendingAnalytics> getTopTrendingAnalytics() {
        try {
            return productTrendingAnalyticsRepository.findAllByOrderByRankOrderAsc();
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    /**
     * Checks if a user is considered new / guest (i.e. has no recorded category
     * preference).
     */
    public boolean isNewOrInactiveUser(User user) {
        return getUserCategoryPreference(user).isEmpty();
    }

    /**
     * Refreshes the in-memory trending product cache every 5 minutes.
     * Runs on the analyticsExecutor thread pool so a slow DB scan
     * never delays a user-facing HTTP response.
     */
    @Scheduled(fixedRate = 300000, initialDelay = 0)
    @Async("analyticsExecutor")
    public void refreshTrendingCache() {
        try {
            List<Product> allProducts = new ArrayList<>(productRepository.findAll());
            Map<Long, Integer> rankMap = buildRankMap();

            allProducts.sort((p1, p2) -> {
                if (p1 == null && p2 == null)
                    return 0;
                if (p1 == null)
                    return 1;
                if (p2 == null)
                    return -1;
                long id1 = p1.getId() != null ? p1.getId() : 0L;
                long id2 = p2.getId() != null ? p2.getId() : 0L;
                int r1 = rankMap.getOrDefault(id1, Integer.MAX_VALUE);
                int r2 = rankMap.getOrDefault(id2, Integer.MAX_VALUE);
                if (r1 != r2)
                    return Integer.compare(r1, r2);
                return Long.compare(id1, id2);
            });

            // Atomic volatile swap — no locking needed
            this.cachedRankMap = rankMap;
            this.cachedTrendingFeed = allProducts;
        } catch (Exception e) {
            // Keep stale cache on error — never return empty to users
            System.err.println("[Analytics] Cache refresh failed: " + e.getMessage());
        }
    }

    /**
     * Generates a personalized product feed for a user:
     * - New/Guest User: Returns cached trending feed (no DB call).
     * - Active User: Personalized preferred-category boost on top of cache.
     */
    public List<Product> getUserProductFeed(User user) {
        // Use cached feed — no full DB scan per HTTP request
        List<Product> allProducts = new ArrayList<>(cachedTrendingFeed);
        Optional<UserCategoryPreference> prefOpt = getUserCategoryPreference(user);

        if (prefOpt.isEmpty()) {
            // New user — cache is already sorted by trending rank
            return allProducts;
        }

        // Active User Feed — personalize on top of cached sorted list
        UserCategoryPreference pref = prefOpt.get();
        Long preferredCatId = pref.getCategoryId();
        String preferredCatName = pref.getCategoryName();
        Map<Long, Integer> rankMap = cachedRankMap;

        allProducts.sort((p1, p2) -> {
            if (p1 == null && p2 == null)
                return 0;
            if (p1 == null)
                return 1;
            if (p2 == null)
                return -1;

            boolean p1Preferred = isMatchingCategory(p1, preferredCatId, preferredCatName);
            boolean p2Preferred = isMatchingCategory(p2, preferredCatId, preferredCatName);

            if (p1Preferred != p2Preferred) {
                return p1Preferred ? -1 : 1;
            }

            long id1 = p1.getId() != null ? p1.getId() : 0L;
            long id2 = p2.getId() != null ? p2.getId() : 0L;
            int rank1 = rankMap.getOrDefault(id1, Integer.MAX_VALUE);
            int rank2 = rankMap.getOrDefault(id2, Integer.MAX_VALUE);

            if (rank1 != rank2) {
                return Integer.compare(rank1, rank2);
            }
            return Long.compare(id1, id2);
        });

        return allProducts;
    }

    /**
     * Generates a category feed reordered with user's preferred category at
     * position #1.
     */
    public List<Category> getCategoryFeed(User user) {
        List<Category> allCategories = new ArrayList<>(categoryRepository.findAll());
        Optional<UserCategoryPreference> prefOpt = getUserCategoryPreference(user);

        if (prefOpt.isPresent()) {
            UserCategoryPreference pref = prefOpt.get();
            Long preferredCatId = pref.getCategoryId();
            String preferredCatName = pref.getCategoryName();

            allCategories.sort((c1, c2) -> {
                if (c1 == null && c2 == null)
                    return 0;
                if (c1 == null)
                    return 1;
                if (c2 == null)
                    return -1;

                boolean c1Preferred = (preferredCatId != null && preferredCatId.equals(c1.getId()))
                        || (preferredCatName != null && preferredCatName.equalsIgnoreCase(c1.getName()));
                boolean c2Preferred = (preferredCatId != null && preferredCatId.equals(c2.getId()))
                        || (preferredCatName != null && preferredCatName.equalsIgnoreCase(c2.getName()));

                if (c1Preferred != c2Preferred) {
                    return c1Preferred ? -1 : 1;
                }
                String n1 = c1.getName() != null ? c1.getName() : "";
                String n2 = c2.getName() != null ? c2.getName() : "";
                return n1.compareToIgnoreCase(n2);
            });
        }

        return allCategories;
    }

    private Map<Long, Integer> getTrendingRankMap1() {
        List<ProductTrendingAnalytics> trendingList = productTrendingAnalyticsRepository.findAllByOrderByRankOrderAsc();
        Map<Long, Integer> map = new HashMap<>();
        for (ProductTrendingAnalytics t : trendingList) {
            if (t.getProductId() != null && t.getRankOrder() != null) {
                map.put(t.getProductId(), t.getRankOrder());
            }
        }
        return map;
    }

    // Internal method using cached rank map
    private Map<Long, Integer> getTrendingRankMap() {
        return cachedRankMap;
    }

    // Builds a fresh rank map directly from DB (used only by cache refresh)
    private Map<Long, Integer> buildRankMap() {
        List<ProductTrendingAnalytics> trendingList = productTrendingAnalyticsRepository.findAllByOrderByRankOrderAsc();
        Map<Long, Integer> map = new HashMap<>();
        for (ProductTrendingAnalytics t : trendingList) {
            if (t.getProductId() != null && t.getRankOrder() != null) {
                map.put(t.getProductId(), t.getRankOrder());
            }
        }
        return map;
    }

    private boolean isMatchingCategory(Product product, Long catId, String catName) {
        if (product == null || product.getCategory() == null)
            return false;
        if (catId != null && catId.equals(product.getCategory().getId()))
            return true;
        return catName != null && catName.equalsIgnoreCase(product.getCategory().getName());
    }
}
