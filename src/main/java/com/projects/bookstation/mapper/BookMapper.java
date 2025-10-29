package com.projects.bookstation.mapper;

import com.projects.bookstation.dto.request.BookRequest;
import com.projects.bookstation.dto.response.BookResponse;
import com.projects.bookstation.dto.response.BorrowedBookResponse;
import com.projects.bookstation.entity.Book;
import com.projects.bookstation.entity.BookTransactionHistory;
import com.projects.bookstation.utils.FileUtils;
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
        return BookResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .isbn(book.getIsbn())
                .synopsis(book.getSynopsis())
                .rate(book.getRate())
                .archived(book.isArchived())
                .shareable(book.isShareable())
//                .owner(book.getOwner().fullName())
                .cover(FileUtils.readFileFromLocation(book.getBookCover()))
                .build();
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
