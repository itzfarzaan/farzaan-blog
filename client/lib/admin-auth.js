import { fetchApi } from './api';

export async function signOut() {
    try {
        await fetchApi('/auth/logout', { method: 'POST' });
    } catch (error) {
        // best-effort; cookie may already be expired
    }
}
