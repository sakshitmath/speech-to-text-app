package com.sttapp.backend.repository;

import com.sttapp.backend.model.Transcription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TranscriptionRepository extends JpaRepository<Transcription, Long> {
    List<Transcription> findByUserIdOrderByCreatedAtDesc(Long userId);
}