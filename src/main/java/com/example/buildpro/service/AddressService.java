package com.example.buildpro.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.buildpro.model.Address;
import com.example.buildpro.model.User;
import com.example.buildpro.repository.AddressRepository;

@Service
public class AddressService {

    @Autowired
    private AddressRepository addressRepository;

    public List<Address> getUserAddresses(User user) {
        return addressRepository.findByUser(user);
    }

    @org.springframework.transaction.annotation.Transactional
    public Address createAddress(User user, Address address) {
        address.setUser(user);

        // If this is the first address, set it as default
        if (addressRepository.findByUser(user).isEmpty()) {
            address.setIsDefault(true);
        } else if (address.getIsDefault()) {
            // New one is default, reset others
            // Implementation note: we save the new one effectively first or after?
            // If we save first, we must exclude its ID.
            // Let's save first.
        }

        Address savedAddress = addressRepository.save(address);

        if (savedAddress.getIsDefault()) {
            addressRepository.removeDefaultStatus(user, savedAddress.getId());
        }

        return savedAddress;
    }

    @org.springframework.transaction.annotation.Transactional
    public Address updateAddress(Long addressId, User user, Address addressDetails) {
        Optional<Address> addressOpt = addressRepository.findByIdAndUser(addressId, user);
        if (addressOpt.isPresent()) {
            Address address = addressOpt.get();
            address.setName(addressDetails.getName());
            address.setPhone(addressDetails.getPhone());
            address.setAddressLine1(addressDetails.getAddressLine1());
            address.setAddressLine2(addressDetails.getAddressLine2());
            address.setCity(addressDetails.getCity());
            address.setState(addressDetails.getState());
            address.setPostalCode(addressDetails.getPostalCode());
            address.setCountry(addressDetails.getCountry());

            boolean wasDefault = address.getIsDefault();
            address.setIsDefault(addressDetails.getIsDefault());

            Address savedAddress = addressRepository.save(address);

            // If setting as default, remove default from other addresses
            if (savedAddress.getIsDefault()) {
                addressRepository.removeDefaultStatus(user, savedAddress.getId());
            } else if (wasDefault) {
                // It WAS default, now it's not. We must ensure there is SOME default.
                // Pick another one.
                Address newDefault = addressRepository.findFirstByUserOrderByIdAsc(user);
                if (newDefault != null && !newDefault.getId().equals(savedAddress.getId())) {
                    newDefault.setIsDefault(true);
                    addressRepository.save(newDefault);
                }
            }

            return savedAddress;
        }
        return null;
    }

    @org.springframework.transaction.annotation.Transactional
    public boolean deleteAddress(Long addressId, User user) {
        Optional<Address> addressOpt = addressRepository.findByIdAndUser(addressId, user);
        if (addressOpt.isPresent()) {
            Address address = addressOpt.get();
            boolean wasDefault = address.getIsDefault();

            addressRepository.delete(address);

            // If deleting default address, set another address as default
            if (wasDefault) {
                Address newDefault = addressRepository.findFirstByUserOrderByIdAsc(user);
                if (newDefault != null) {
                    newDefault.setIsDefault(true);
                    addressRepository.save(newDefault);
                }
            }
            return true;
        }
        return false;
    }

    public Address getDefaultAddress(User user) {
        List<Address> defaultAddresses = addressRepository.findByUserAndIsDefaultTrue(user);
        return defaultAddresses.isEmpty() ? null : defaultAddresses.get(0);
    }

    // stable efficient query
}