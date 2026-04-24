package com.sliit.paf.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminReviewDto {
    private boolean approved;
    private String reason;
}
