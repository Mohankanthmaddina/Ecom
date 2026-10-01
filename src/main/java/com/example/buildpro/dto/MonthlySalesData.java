package com.example.buildpro.dto;

public class MonthlySalesData {
    private String month;
    private Double sales;

    public MonthlySalesData(String month, Double sales) {
        this.month = month;
        this.sales = sales;
    }

    public MonthlySalesData() {
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public Double getSales() {
        return sales;
    }

    public void setSales(Double sales) {
        this.sales = sales;
    }
}
