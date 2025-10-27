package com.projects.bookstation.service;

import com.projects.bookstation.dto.request.BookRequest;
import com.projects.bookstation.dto.response.BookResponse;
import com.projects.bookstation.dto.response.BorrowedBookResponse;
import com.projects.bookstation.dto.response.PageResponse;
import com.projects.bookstation.entity.Book;
import com.projects.bookstation.entity.BookTransactionHistory;
import com.projects.bookstation.entity.User;
import com.projects.bookstation.mapper.BookMapper;
import com.projects.bookstation.repository.BookRepository;
import com.projects.bookstation.repository.BookTransactionHistoryRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.config.SortHandlerMethodArgumentResolverCustomizer;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

import static com.projects.bookstation.specification.BookSpecification.withOwnerId;

@Service
@RequiredArgsConstructor
public class BookService {
    private final BookRepository bookRepository;
    private final BookTransactionHistoryRepository bookTransactionHistoryRepository;
    private final BookMapper bookMapper;
    private final SortHandlerMethodArgumentResolverCustomizer sortCustomizer;


    public Integer saveBook(@Valid BookRequest bookRequest, Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        Book book = bookMapper.toBookEntity(bookRequest);
        book.setOwner(user);
        return bookRepository.save(book).getId();
    }

    public BookResponse getById(Integer id) {
        return bookRepository.findById(id)
                .map(bookMapper::toBookResponse)
                .orElseThrow(() -> new EntityNotFoundException("Book not found"));
    }

    public PageResponse<BookResponse> getAllBooks(Integer page, Integer size, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Pageable pageable = PageRequest.of(page, size, Sort.by("CreatedDate").descending());
        Page<Book> bookPage = bookRepository.findAllDisplayableBooks(user.getId(), pageable);
        List<BookResponse> bookResponses = bookPage.stream()
                .map(bookMapper::toBookResponse)
                .toList();
        return new PageResponse<>(
                bookResponses,
                bookPage.getNumber(),
                bookPage.getSize(),
                bookPage.getTotalElements(),
                bookPage.getTotalPages(),
                bookPage.isFirst(),
                bookPage.isLast()
        );
    }

    public PageResponse<BookResponse> getAllOwnerBooks(Integer page, Integer size, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Pageable pageable = PageRequest.of(page, size, Sort.by("CreatedDate").descending());
        Page<Book> bookPage = bookRepository.findAll(withOwnerId(user.getId()), pageable);
        List<BookResponse> bookResponses = bookPage.stream()
                .map(bookMapper::toBookResponse)
                .toList();
        return new PageResponse<>(
                bookResponses,
                bookPage.getNumber(),
                bookPage.getSize(),
                bookPage.getTotalElements(),
                bookPage.getTotalPages(),
                bookPage.isFirst(),
                bookPage.isLast()
        );
    }

    public PageResponse<BorrowedBookResponse> getAllBorrowedBooks (Integer page, Integer size, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Pageable pageable = PageRequest.of(page, size, Sort.by("CreatedDate").descending());
        Page<BookTransactionHistory> historyPage = bookTransactionHistoryRepository.findAllBorrowedBooks(pageable, user.getId());
        List<BorrowedBookResponse> borrowedBookResponses = historyPage.stream()
                .map(bookMapper::toBorrowedBookResponse)
                .toList();
        return new PageResponse<>(
                borrowedBookResponses,
                historyPage.getNumber(),
                historyPage.getSize(),
                historyPage.getTotalElements(),
                historyPage.getTotalPages(),
                historyPage.isFirst(),
                historyPage.isLast()
        );
    }

    public PageResponse<BorrowedBookResponse> getAllReturnedBooks (Integer page, Integer size, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Pageable pageable = PageRequest.of(page, size, Sort.by("CreatedDate").descending());
        Page<BookTransactionHistory> historyPage = bookTransactionHistoryRepository.findAllReturnedBooks(pageable, user.getId());
        List<BorrowedBookResponse> borrowedBookResponses = historyPage.stream()
                .map(bookMapper::toBorrowedBookResponse)
                .toList();
        return new PageResponse<>(
                borrowedBookResponses,
                historyPage.getNumber(),
                historyPage.getSize(),
                historyPage.getTotalElements(),
                historyPage.getTotalPages(),
                historyPage.isFirst(),
                historyPage.isLast()
        );
    }
}
