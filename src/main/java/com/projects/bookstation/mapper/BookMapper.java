package com.projects.bookstation.mapper;

import com.projects.bookstation.dto.request.BookRequest;
import com.projects.bookstation.dto.response.BookResponse;
import com.projects.bookstation.dto.response.BorrowedBookResponse;
import com.projects.bookstation.entity.Book;
import com.projects.bookstation.entity.BookTransactionHistory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BookMapper {

    public Book toBookEntity(BookRequest bookRequest) {
        return Book.builder()
                .id(bookRequest.id())
                .title(bookRequest.title())
                .author(bookRequest.author())
                .isbn(bookRequest.isbn())
                .synopsis(bookRequest.synopsis())
                .shareable(bookRequest.shareable())
                .build();
    }

    public BookResponse toBookResponse(Book book) {
        BookResponse bookResponse = new BookResponse();
        bookResponse.setId(book.getId());
        bookResponse.setTitle(book.getTitle());
        bookResponse.setAuthor(book.getAuthor());
        bookResponse.setIsbn(book.getIsbn());
        bookResponse.setSynopsis(book.getSynopsis());
        bookResponse.setOwner(book.getOwner().getUsername());
        bookResponse.setRate(book.getRate());
        bookResponse.setArchived(book.isArchived());
        bookResponse.setShareable(book.isShareable());
        return bookResponse;
    }

    public BorrowedBookResponse toBorrowedBookResponse(BookTransactionHistory history) {
        BorrowedBookResponse response = new BorrowedBookResponse();
        Book book = history.getBook();
        response.setId(book.getId());
        response.setTitle(book.getTitle());
        response.setAuthor(book.getAuthor());
        response.setIsbn(book.getIsbn());
        response.setRate(book.getRate());
        response.setReturned(history.isReturned());
        response.setReturnApproved(history.isReturnApproved());
        return response;
    }
}
