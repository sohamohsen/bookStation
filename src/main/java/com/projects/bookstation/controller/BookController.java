package com.projects.bookstation.controller;

import com.projects.bookstation.dto.request.BookRequest;
import com.projects.bookstation.dto.response.PageResponse;
import com.projects.bookstation.service.BookService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
@Tag(name = "Book Controller", description = "APIs for managing books in the Book Station application")
public class BookController {

    private BookService bookService;

    @PostMapping("/add")
    public ResponseEntity<?> addBook(
            @RequestBody @Valid BookRequest bookRequest,
            Authentication authentication
    ) {

        return ResponseEntity.ok(bookService.saveBook(bookRequest, authentication));
    }

    @GetMapping("/get-book/{id}")
    public ResponseEntity<?> getBookById(@PathVariable Integer id) {
        return ResponseEntity.ok(bookService.getById(id));
    }

    @GetMapping("/get-all-books")
    public ResponseEntity<PageResponse<?>> getAllBooks(
            @RequestParam(name = "page", defaultValue = "0", required = false) Integer page,
            @RequestParam(name = "size", defaultValue = "10", required = false) Integer size,
            Authentication authentication
    ) {
        return ResponseEntity.ok(bookService.getAllBooks(page, size, authentication));
    }

    @GetMapping("/get-owner-books")
    public ResponseEntity<PageResponse<?>> getAllOwnerBooks(
            @RequestParam(name = "page", defaultValue = "0", required = false) Integer page,
            @RequestParam(name = "size", defaultValue = "10", required = false) Integer size,
            Authentication authentication
    ) {
        return ResponseEntity.ok(bookService.getAllOwnerBooks(page, size, authentication));
    }

    @GetMapping("/get-borrowed-books")
    public ResponseEntity<PageResponse<?>> getAllBorrowedBooks(
            @RequestParam(name = "page", defaultValue = "0", required = false) Integer page,
            @RequestParam(name = "size", defaultValue = "10", required = false) Integer size,
            Authentication authentication
    ) {
        return ResponseEntity.ok(bookService.getAllBorrowedBooks(page, size, authentication));
    }

    @GetMapping("/get-returned-books")
    public ResponseEntity<PageResponse<?>> getAllReturnedBooks(
            @RequestParam(name = "page", defaultValue = "0", required = false) Integer page,
            @RequestParam(name = "size", defaultValue = "10", required = false) Integer size,
            Authentication authentication
    ) {
        return ResponseEntity.ok(bookService.getAllReturnedBooks(page, size, authentication));
    }

    @PatchMapping("/update-sharable-book/{id}")
    public ResponseEntity<?> updateBookShareableStatus(
            @PathVariable Integer id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(bookService.updateBookShareableStatus(id, authentication));
    }

    @PatchMapping("/update-archive-book/{id}")
    public ResponseEntity<?> updateBookArchiveStatus(
            @PathVariable Integer id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(bookService.updateBookArchiveStatus(id, authentication));
    }

    @PostMapping("/request-borrow-book/{id}")
    public ResponseEntity<?> requestBorrowBook(
            @PathVariable Integer id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(bookService.requestBorrowBook(id, authentication));
    }

    @PatchMapping("/return-book/{id}")
    public ResponseEntity<?> returnBorrowedBook(
            @PathVariable Integer id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(bookService.returnBorrowedBook(id, authentication));
    }

    @PatchMapping("/approve-return-book/{id}")
    public ResponseEntity<?> approveReturnBorrowedBook(
            @PathVariable Integer id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(bookService.approveReturnBorrowedBook(id, authentication));
    }

    @PostMapping(value = "/upload-cover-image/{bookId}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> uploadBookCoverImage(
            @PathVariable Integer bookId,
            @RequestPart("image") MultipartFile file,
            Authentication authentication
    ) {
        bookService.uploadBookCoverImage(bookId, file, authentication);
        return ResponseEntity.accepted().build();
    }
}