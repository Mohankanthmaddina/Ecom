package com.example.buildpro.controller;

import com.example.buildpro.service.ReportsService;
import com.example.buildpro.dto.CategorySalesReport;
import com.example.buildpro.dto.TrendingItemReport;
import com.example.buildpro.dto.SalesSummaryReport;
import com.example.buildpro.dto.MonthlySalesData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/admin/reports")
public class ReportsController {

    @Autowired
    private ReportsService reportsService;

    @GetMapping
    public String reportsPage(Model model) {
        try {

            // Get analytics data
            List<CategorySalesReport> topCategories = reportsService.getMostBuyingCategories();
            List<TrendingItemReport> trendingItems = reportsService.getMostTrendingItems();
            SalesSummaryReport salesSummary = reportsService.getSalesSummary();
            List<MonthlySalesData> monthlySales = reportsService.getMonthlySalesData();

            // Add data to model
            model.addAttribute("topCategories", topCategories);
            model.addAttribute("trendingItems", trendingItems);
            model.addAttribute("salesSummary", salesSummary);
            model.addAttribute("monthlySales", monthlySales);

            return "admin-reports";
        } catch (Exception e) {
            model.addAttribute("error", "Error loading reports: " + e.getMessage());
            // Add empty defaults to prevent Thymeleaf from crashing when evaluating
            // variables
            model.addAttribute("topCategories", java.util.Collections.emptyList());
            model.addAttribute("trendingItems", java.util.Collections.emptyList());
            model.addAttribute("salesSummary", new SalesSummaryReport(0.0, 0, 0, 0, 0, 0, 0.0));
            model.addAttribute("monthlySales", java.util.Collections.emptyList());
            return "admin-reports";
        }
    }
}
