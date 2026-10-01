package com.example.buildpro.service;


import com.example.buildpro.model.Complaint;
import com.example.buildpro.model.Order;
import com.example.buildpro.model.Product;
import com.example.buildpro.model.User;
import com.example.buildpro.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ComplaintService {

    @Autowired
    private ComplaintRepository complaintRepository;

    public Complaint submitComplaint(User user, Order order, Product product, String issueType, String description) {
        Complaint complaint = new Complaint();
        complaint.setUser(user);
        complaint.setOrder(order);
        complaint.setProduct(product);
        complaint.setIssueType(issueType);
        complaint.setDescription(description);
        return complaintRepository.save(complaint);
    }

    public List<Complaint> getComplaintsByUser(User user) {
        return complaintRepository.findByUser(user);
    }

    public List<Complaint> getComplaintsByOrder(Order order) {
        return complaintRepository.findByOrder(order);
    }

    public Optional<Complaint> getComplaintById(Long id) {
        return complaintRepository.findById(id);
    }

    public void updateComplaint(Complaint complaint) {
        complaintRepository.save(complaint);
    }


}
