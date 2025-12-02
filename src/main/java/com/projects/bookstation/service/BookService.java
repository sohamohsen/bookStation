package com.projects.bookstation.service;

import com.projects.bookstation.dto.request.BookRequest;
import com.projects.bookstation.dto.response.BookResponse;
import com.projects.bookstation.dto.response.BorrowedBookResponse;
import com.projects.bookstation.dto.response.PageResponse;
import com.projects.bookstation.entity.Book;
import com.projects.bookstation.entity.BookTransactionHistory;
import com.projects.bookstation.entity.User;
import com.projects.bookstation.handler.excption.OperationNotPermittedException;
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
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.util.Base64;
import java.util.List;

import static com.projects.bookstation.utils.BookSpecification.withOwnerId;

@Service
@RequiredArgsConstructor
public class BookService {
    private final BookRepository bookRepository;
    private final BookTransactionHistoryRepository bookTransactionHistoryRepository;
    private final BookMapper bookMapper;
    private final FileStorageService fileStorageService;

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
        Pageable pageable = PageRequest.of(page, size);
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
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());
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
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());
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

    public Integer updateBookShareableStatus(Integer id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Book not found"));
        if (!book.getOwner().getId().equals(user.getId())) {
            throw new OperationNotPermittedException("You are not authorized to update this book");
        }
        book.setShareable(book.isShareable());
        return bookRepository.save(book).getId();
    }

    public Integer updateBookArchiveStatus(Integer id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Book not found"));
        if (!book.getOwner().getId().equals(user.getId())) {
            throw new OperationNotPermittedException("You are not authorized to update this book");
        }
        book.setArchived(book.isArchived());
        return bookRepository.save(book).getId();
    }

    public Integer requestBorrowBook(Integer bookId, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new EntityNotFoundException(("Book not found")));
        if(!book.isShareable() || book.isArchived()) {
            throw new OperationNotPermittedException("This book is not shareable");
        }
        if (book.getOwner().getId().equals(user.getId())) {
            throw new OperationNotPermittedException("You are not authorized to borrow this book");
        }
        if(bookTransactionHistoryRepository.isAlreadyBorrowed(bookId, user.getId())){
            throw new OperationNotPermittedException("You are borrowing this book");
        }

        BookTransactionHistory history = BookTransactionHistory.builder()
                .book(book)
                .user(user)
                .returned(false)
                .returnApproved(false)
                .build();
        return bookTransactionHistoryRepository.save(history).getId();

    }

    public Integer returnBorrowedBook(Integer bookId, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new EntityNotFoundException(("Book not found")));
        if(!book.isShareable() || book.isArchived()) {
            throw new OperationNotPermittedException("This book is not shareable");
        }
        BookTransactionHistory history = bookTransactionHistoryRepository.findByBookIdAndUserIdAndReturnedFalseAndReturnApprovedFalse(bookId, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("You didn't borrow this book"));
        if (!history.getUser().getId().equals(user.getId())) {
            throw new OperationNotPermittedException("You are not authorized to return this book");
        }
        history.setReturned(true);
        return bookTransactionHistoryRepository.save(history).getId();
    }

    public Integer approveReturnBorrowedBook(Integer bookId, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new EntityNotFoundException(("Book not found")));
        if(!book.isShareable() || book.isArchived()) {
            throw new OperationNotPermittedException("This book is not shareable");
        }
        BookTransactionHistory history = bookTransactionHistoryRepository.findByBookIdAndUserIdAndReturnedTrueAndReturnApprovedFalse(bookId, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("The book is not returned yet. you cannot approve its return"));
//        if (!history.getUser().getId().equals(user.getId())) {
//            throw new OperationNotPermittedException("You are not authorized to  return this book");
//        }
        history.setReturnApproved(true);
        return bookTransactionHistoryRepository.save(history).getId();
    }

    public void uploadBookCoverImage(
            Integer bookId,
            MultipartFile image,
            Authentication authentication
    ) throws AccessDeniedException, IOException {

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new EntityNotFoundException("Book not found"));

        User user = (User) authentication.getPrincipal();

        if (!book.getOwner().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not allowed to update this book cover");
        }

        // حوّل الصورة لـ Base64 وخزنها في الـ DB كسطر نصي
        String base64 = Base64.getEncoder().encodeToString(image.getBytes());
        book.setBookCover(base64);

        bookRepository.save(book);
    }

}
