package com.sttapp.backend.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TranscriptionResponse {
    private Long id;
    private String audioFilename;
    private String transcript;
    private String status;
    private String language;
    private Double durationSeconds;
    private LocalDateTime createdAt;
}