const FALLBACK_BASE_URL = 'http://127.0.0.1:5001/api';

export function getServerApiBaseUrl() {
    return process.env.API_BASE_URL || FALLBACK_BASE_URL;
}

export function getClientApiBaseUrl() {
    return process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
}

export async function fetchApi(path, options = {}) {
    const response = await fetch(`${getClientApiBaseUrl()}${path}`, options);
    let payload = null;

    try {
        payload = await response.json();
    } catch (error) {
        if (!response.ok) {
            throw new Error(`Request failed (${response.status})`);
        }
    }

    if (response.status === 401 || response.status === 403) {
        throw new Error('Session expired');
    }

    if (!response.ok) {
        throw new Error(payload?.error || payload?.errors?.join(', ') || `Request failed (${response.status})`);
    }

    return payload;
}

export async function fetchServerApi(path, options = {}) {
    const response = await fetch(`${getServerApiBaseUrl()}${path}`, options);
    if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
    }

    return response.json();
}
