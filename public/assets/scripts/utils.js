// Utility functions

// getUserIdFromUrl

export function getUserIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('user'); // returns null if not present
}

// parseJWT

// XSS Sanitisation
