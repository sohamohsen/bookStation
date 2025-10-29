package com.projects.bookstation.repository;

import com.projects.bookstation.entity.Feedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {

    @Query("""
            SELECT f FROM Feedback f
            WHERE f.book.id = :bookId
            """
    )
    Page<Feedback> findByBookId(Integer bookId, Pageable pageable);
}
