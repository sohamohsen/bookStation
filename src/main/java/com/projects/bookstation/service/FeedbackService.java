package com.projects.bookstation.service;

import com.projects.bookstation.dto.request.FeedbackRequest;
import com.projects.bookstation.dto.response.FeedbackResponse;
import com.projects.bookstation.dto.response.PageResponse;
import com.projects.bookstation.entity.Book;
import com.projects.bookstation.entity.Feedback;
import com.projects.bookstation.entity.User;
import com.projects.bookstation.mapper.FeedbackMapper;
import com.projects.bookstation.repository.BookRepository;
import com.projects.bookstation.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final BookRepository bookRepository;

    public Integer saveFeedback(FeedbackRequest feedbackRequest, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Book book = bookRepository.findById(feedbackRequest.bookId())
                .orElseThrow(() -> new RuntimeException("Book not found"));
        if (book.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("Owners cannot submit feedback for their own books");
        }
        if (!book.isShareable() || book.isArchived()) {
            throw new RuntimeException("Feedback can only be submitted for shareable and active books");
        }
        Feedback feedback = FeedbackMapper.toFeedback(feedbackRequest);
        return feedbackRepository.save(feedback).getId();
    }

    public PageResponse<FeedbackResponse> getFeedbacksByBookId(Integer bookId, Integer page, Integer size, Authentication authentication) {
        Pageable pageable = PageRequest.of(page, size);
        User user = (User) authentication.getPrincipal();
        Page<Feedback> feedbacks = feedbackRepository.findByBookId(bookId, pageable);
        List<FeedbackResponse> feedbackResponses = feedbacks.stream()
                .map(feedback -> FeedbackMapper.toFeedbackResponse(feedback, user.getId()))
                .toList();
        return new PageResponse<>(
                feedbackResponses,
                feedbacks.getNumber(),
                feedbacks.getSize(),
                feedbacks.getTotalElements(),
                feedbacks.getTotalPages(),
                feedbacks.isFirst(),
                feedbacks.isLast()
        );
    }
}
