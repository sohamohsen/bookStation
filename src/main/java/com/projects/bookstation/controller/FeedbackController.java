package com.projects.bookstation.controller;

import com.projects.bookstation.service.FeedbackService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "Feedback")
@RequestMapping("feedbacks")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public ResponseEntity<?> saveFeedback(
            @RequestBody @Valid FeedbackRequest feedbackRequest,
            Authentication authentication
    ){

    }
}
