package com.projects.bookstation.dto.response;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FeedbackResponse {

    private double rating;
    private String comment;
    private boolean ownFeedback;
}