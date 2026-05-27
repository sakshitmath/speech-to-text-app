package com.sttapp.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sttapp.backend.dto.TranscriptionResponse;
import com.sttapp.backend.model.Transcription;
import com.sttapp.backend.model.User;
import com.sttapp.backend.repository.TranscriptionRepository;
import com.sttapp.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SpeechService {

    @Value("${assemblyai.api.key}")
    private String apiKey;

    private final TranscriptionRepository transcriptionRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    private String uploadAudioToAssemblyAI(byte[] audioBytes)
            throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.assemblyai.com/v2/upload"))
                .header("authorization", apiKey)
                .header("Content-Type", "application/octet-stream")
                .POST(HttpRequest.BodyPublishers.ofByteArray(audioBytes))
                .build();

        HttpResponse<String> response = httpClient.send(request,
                HttpResponse.BodyHandlers.ofString());

        System.out.println("UPLOAD STATUS: " + response.statusCode());
        System.out.println("UPLOAD BODY: " + response.body());

        JsonNode jsonNode = objectMapper.readTree(response.body());
        if (jsonNode.get("upload_url") == null) {
            throw new RuntimeException("Upload failed: " + response.body());
        }
        return jsonNode.get("upload_url").asText();
    }

    private String submitTranscription(String audioUrl, String language)
            throws IOException, InterruptedException {

        StringBuilder requestBody = new StringBuilder();
        requestBody.append("{");
        requestBody.append("\"audio_url\": \"").append(audioUrl).append("\"");
        requestBody.append(", \"speech_models\": [\"universal-2\"]");
        requestBody.append(", \"summarization\": true");
        requestBody.append(", \"summary_model\": \"informative\"");
        requestBody.append(", \"summary_type\": \"bullets\"");

        // Only set language if user explicitly chose one (not auto)
        if (language != null && !language.equals("auto")) {
            requestBody.append(", \"language_code\": \"").append(language).append("\"");
        }
        // If auto — AssemblyAI detects language automatically

        requestBody.append("}");

        System.out.println("SUBMIT BODY: " + requestBody);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.assemblyai.com/v2/transcript"))
                .header("authorization", apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                .build();

        HttpResponse<String> response = httpClient.send(request,
                HttpResponse.BodyHandlers.ofString());

        System.out.println("SUBMIT STATUS: " + response.statusCode());
        System.out.println("SUBMIT RESPONSE: " + response.body());

        JsonNode jsonNode = objectMapper.readTree(response.body());
        if (jsonNode.get("id") == null) {
            throw new RuntimeException("Submit failed: " + response.body());
        }
        return jsonNode.get("id").asText();
    }

    private String[] pollForResult(String transcriptId)
            throws IOException, InterruptedException {
        while (true) {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(
                            "https://api.assemblyai.com/v2/transcript/" + transcriptId))
                    .header("authorization", apiKey)
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request,
                    HttpResponse.BodyHandlers.ofString());

            JsonNode jsonNode = objectMapper.readTree(response.body());
            String status = jsonNode.get("status").asText();
            System.out.println("POLL STATUS: " + status);

            if (status.equals("completed")) {
                String transcript = jsonNode.get("text").asText();
                // Get summary if available
                String summary = "";
                if (jsonNode.has("summary") && !jsonNode.get("summary").isNull()) {
                    summary = jsonNode.get("summary").asText();
                }
                // Get detected language
                String detectedLanguage = "en";
                if (jsonNode.has("language_code") &&
                        !jsonNode.get("language_code").isNull()) {
                    detectedLanguage = jsonNode.get("language_code").asText();
                }
                return new String[]{transcript, summary, detectedLanguage};
            } else if (status.equals("error")) {
                throw new RuntimeException("Transcription error: "
                        + jsonNode.get("error").asText());
            }
            Thread.sleep(3000);
        }
    }

    public TranscriptionResponse transcribeAudio(
            MultipartFile file, String userEmail, String language)
            throws IOException, InterruptedException {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));

        String uploadUrl = uploadAudioToAssemblyAI(file.getBytes());
        String transcriptId = submitTranscription(uploadUrl, language);
        String[] results = pollForResult(transcriptId);

        String transcriptText = results[0];
        String summary = results[1];
        String detectedLanguage = results[2];

        // Calculate word count
        int wordCount = transcriptText.trim().isEmpty() ? 0 :
                transcriptText.trim().split("\\s+").length;

        Transcription transcription = new Transcription();
        transcription.setUser(user);
        transcription.setAudioFilename(file.getOriginalFilename());
        transcription.setAudioUrl(uploadUrl);
        transcription.setTranscript(transcriptText);
        transcription.setSummary(summary);
        transcription.setStatus("completed");
        transcription.setLanguage(detectedLanguage);
        transcription.setWordCount(wordCount);

        Transcription saved = transcriptionRepository.save(transcription);
        return mapToResponse(saved);
    }

    public List<TranscriptionResponse> getUserTranscriptions(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));
        return transcriptionRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TranscriptionResponse getTranscriptionById(
            Long id, String userEmail) {
        Transcription transcription = transcriptionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Transcription not found"));
        if (!transcription.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized");
        }
        return mapToResponse(transcription);
    }

    private TranscriptionResponse mapToResponse(Transcription t) {
        TranscriptionResponse response = new TranscriptionResponse();
        response.setId(t.getId());
        response.setAudioFilename(t.getAudioFilename());
        response.setTranscript(t.getTranscript());
        response.setSummary(t.getSummary());
        response.setStatus(t.getStatus());
        response.setLanguage(t.getLanguage());
        response.setWordCount(t.getWordCount());
        response.setDurationSeconds(t.getDurationSeconds());
        response.setCreatedAt(t.getCreatedAt());
        return response;
    }
}