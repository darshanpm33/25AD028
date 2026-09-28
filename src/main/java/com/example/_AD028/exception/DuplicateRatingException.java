package com.example._AD028.exception;

public class DuplicateRatingException extends RuntimeException {

    public DuplicateRatingException(String message) {
        super(message);
    }
}