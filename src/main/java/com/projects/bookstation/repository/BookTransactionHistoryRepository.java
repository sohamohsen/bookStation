package com.projects.bookstation.repository;

import com.projects.bookstation.entity.BookTransactionHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;


public interface BookTransactionHistoryRepository extends JpaRepository<BookTransactionHistory, Integer> {

    @Query("""
            SELECT history FROM BookTransactionHistory history
            WHERE  history.user.id = :userId
            """)
    Page<BookTransactionHistory> findAllBorrowedBooks(Pageable pageable, Integer userId);

    @Query("""
            SELECT history FROM BookTransactionHistory history
            WHERE  history.book.owner.id = :userId
            """)
    Page<BookTransactionHistory> findAllReturnedBooks(Pageable pageable, Integer userId);

    @Query("""
          SELECT CASE WHEN COUNT(h) > 0 THEN true ELSE false END
          FROM BookTransactionHistory h
          WHERE h.book.id = :bookId
            AND h.user.id = :userId
            AND h.returnApproved
            AND h.returnApproved = false
         """)
    boolean isAlreadyBorrowed(Integer bookId, Integer userId);

    Optional<BookTransactionHistory> findByBookIdAndUserIdAndReturnedFalseAndReturnApprovedFalse(Integer bookId, Integer userId);

    @Query("""
    SELECT h
    FROM BookTransactionHistory h
    WHERE h.book.id = :bookId
      AND h.user.id = :userId
      AND h.returned = true
      AND h.returnApproved = false
""")
    Optional<BookTransactionHistory> findByBookIdAndUserIdAndReturnedTrueAndReturnApprovedFalse(
            @Param("bookId") Integer bookId,
            @Param("userId") Integer userId
    );
}
