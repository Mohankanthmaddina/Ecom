package com.example.buildpro.repository;

import com.example.buildpro.model.Complaint;
import com.example.buildpro.model.Order;
import com.example.buildpro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByUser(User user);
    List<Complaint> findByOrder(Order order);
}
