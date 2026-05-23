package com.sttapp.backend.controller;

import com.sttapp.backend.dto.TranscriptionResponse;
import com.sttapp.backend.service.SpeechService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/speech")
@RequiredArgsConstructor
public class SpeechController {

    private final SpeechService speechService;

    @PostMapping("/transcribe")
    public ResponseEntity<TranscriptionResponse> transcribe(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails)
            throws IOException, InterruptedException {

        TranscriptionResponse response = speechService.transcribeAudio(
                file, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<TranscriptionResponse>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<TranscriptionResponse> history =
                speechService.getUserTranscriptions(userDetails.getUsername());
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TranscriptionResponse> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        TranscriptionResponse response =
                speechService.getTranscriptionById(id, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }
}