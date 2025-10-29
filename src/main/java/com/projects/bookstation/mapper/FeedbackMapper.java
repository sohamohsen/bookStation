package com.projects.bookstation.mapper;

import com.projects.bookstation.dto.request.FeedbackRequest;
import com.projects.bookstation.dto.response.FeedbackResponse;
import com.projects.bookstation.entity.Book;
import com.projects.bookstation.entity.Feedback;
import org.springframework.stereotype.Service;

@Service
public class FeedbackMapper {
    public static Feedback toFeedback(FeedbackRequest request) {
        return Feedback.builder()
                .comment(request.comment())
                .rating(request.rating())
                .book(Book.builder()
                        .id(request.bookId())
                        .build())
                .build();
    }

    public static FeedbackResponse toFeedbackResponse(Feedback feedback, Integer userId) {
        return FeedbackResponse.builder()
                .rating(feedback.getRating())
                .comment(feedback.getComment())
                .ownFeedback(feedback.getCreatedBy().equals(userId))
                .build();
    }
}