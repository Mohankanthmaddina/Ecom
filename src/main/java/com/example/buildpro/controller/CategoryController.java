package com.example.buildpro.controller;

import com.example.buildpro.model.Category;
import com.example.buildpro.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/categories")
public class CategoryController {

    @Autowired
    private ProductService productService;

    // Serve the Thymeleaf HTML page with categories data
    @GetMapping("/view")
    public String categoriesPage(Model model) {
        List<Category> categories = productService.getAllCategories();
        model.addAttribute("categories", categories);
        return "categories"; // categories.html in templates
    }

    // JSON endpoint to fetch categories dynamically if needed
    @GetMapping
    @ResponseBody
    public List<Category> getAllCategories() {
        return productService.getAllCategories();
    }

    @GetMapping("/")
    public String redirectToCategories() {
        return "/homepage";
    }

    @PostMapping
    @ResponseBody
    public Category createCategory(@RequestBody Category category) {
        return productService.createCategory(category);
    }
}
