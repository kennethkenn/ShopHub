package com.ecommerce.dto.request;

import com.ecommerce.model.enums.UserRole;
import lombok.Data;

@Data
public class AdminUserUpdateRequest {
    private UserRole role;
    private Boolean enabled;
}
