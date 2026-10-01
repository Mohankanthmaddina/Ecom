package com.example.buildpro.dto;

import lombok.Data;

@Data
public class ProductDTO {
    private Long id;
    private String name;
    private String brand;
    private String description;
    private Double price;
    private Integer stockQuantity;
    private String imageUrl;
    private String specifications;
    private String categoryName;
    private Long categoryId;
}
