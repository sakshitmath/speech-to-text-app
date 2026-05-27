package com.sttapp.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "transcriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transcription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "audio_filename")
    private String audioFilename;

    @Column(name = "audio_url")
    private String audioUrl;

    @Column(columnDefinition = "TEXT")
    private String transcript;

    @Column
    private String status;

    @Column
    private String language;
    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "word_count")
    private Integer wordCount;

    @Column(name = "duration_seconds")
    private Double durationSeconds;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}