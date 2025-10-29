package com.projects.bookstation.controller;

import com.projects.bookstation.dto.request.FeedbackRequest;
import com.projects.bookstation.dto.response.PageResponse;
import com.projects.bookstation.service.FeedbackService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Feedback")
@RequestMapping("feedbacks")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping("/add")
    public ResponseEntity<?> saveFeedback(
            @RequestBody @Valid FeedbackRequest feedbackRequest,
            Authentication authentication
    ){
        return ResponseEntity.ok(feedbackService.saveFeedback(feedbackRequest, authentication));
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<PageResponse<?>> getFeedbacksByBookId(
            @PathVariable Integer bookId,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            Authentication authentication
    ){
        return ResponseEntity.ok(feedbackService.getFeedbacksByBookId(bookId, page, size, authentication));
    }
}
