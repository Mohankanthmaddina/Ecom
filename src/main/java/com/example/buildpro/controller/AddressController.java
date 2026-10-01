package com.example.buildpro.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.buildpro.model.Address;
import com.example.buildpro.model.User;
import com.example.buildpro.service.AddressService;
import com.example.buildpro.service.IndianLocationService;
import com.example.buildpro.service.UserService;

@RestController
@RequestMapping("/addresses")
public class AddressController {

    @Autowired
    private AddressService addressService;

    @Autowired
    private UserService userService;

    @Autowired
    private IndianLocationService locationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Address>> getUserAddresses(@PathVariable Long userId) {
        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(addressService.getUserAddresses(userOpt.get()));
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<Address> createAddress(@PathVariable Long userId, @RequestBody Address address) {
        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(addressService.createAddress(userOpt.get(), address));
    }

    @PutMapping("/{addressId}/user/{userId}")
    public ResponseEntity<Address> updateAddress(
            @PathVariable Long addressId,
            @PathVariable Long userId,
            @RequestBody Address address) {

        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Address updatedAddress = addressService.updateAddress(addressId, userOpt.get(), address);
        if (updatedAddress == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedAddress);
    }

    @DeleteMapping("/{addressId}/user/{userId}")
    public ResponseEntity<?> deleteAddress(
            @PathVariable Long addressId,
            @PathVariable Long userId) {

        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        boolean deleted = addressService.deleteAddress(addressId, userOpt.get());
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/{userId}/default")
    public ResponseEntity<Address> getDefaultAddress(@PathVariable Long userId) {
        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Address defaultAddress = addressService.getDefaultAddress(userOpt.get());
        if (defaultAddress == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(defaultAddress);
    }

    @PostMapping("/user/{userId}/from-location")
    public ResponseEntity<Map<String, Object>> createAddressFromLocation(
            @PathVariable Long userId,
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam String name,
            @RequestParam String phone) {

        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Validate coordinates
        if (!locationService.isValidCoordinates(latitude, longitude)) {
            return ResponseEntity.badRequest().build();
        }

        try {
            // Get address details from coordinates
            Map<String, String> addressDetails = locationService.getAddressFromCoordinates(latitude, longitude);

            // Create address object
            Address address = new Address();
            address.setUser(userOpt.get());
            address.setName(name);
            address.setPhone(phone);
            address.setAddressLine1(addressDetails.get("addressLine1"));
            address.setAddressLine2(""); // User can fill this manually
            address.setCity(addressDetails.get("city"));
            address.setState(addressDetails.get("state"));
            address.setPostalCode(addressDetails.get("postalCode"));
            address.setCountry(addressDetails.get("country"));
            address.setLatitude(latitude);
            address.setLongitude(longitude);

            // Save address
            Address savedAddress = addressService.createAddress(userOpt.get(), address);

            // Return success response with address details
            Map<String, Object> response = Map.of(
                    "success", true,
                    "address", savedAddress,
                    "message", "Address created successfully from your current location");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = Map.of(
                    "success", false,
                    "message", "Error creating address from location: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
