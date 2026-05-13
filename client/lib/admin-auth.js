const TOKEN_KEY = 'farzaan_blog_admin_token';

export function getToken() {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
    window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
    window.localStorage.removeItem(TOKEN_KEY);
}
