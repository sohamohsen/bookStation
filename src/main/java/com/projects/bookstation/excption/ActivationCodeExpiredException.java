package com.projects.bookstation.excption;

public class ActivationCodeExpiredException extends RuntimeException {
    public ActivationCodeExpiredException(String message) {
        super(message);
    }
}
