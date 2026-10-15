const API_BASE_URL = 'http://192.168.1.20';

async function apiFetch(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: options.method || 'GET',
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            ...(options.request === undefined ? {} : { 'Content-Type': 'application/json' }),
            ...(options.headers || {})
        },
        body: options.request === undefined ? options.body : JSON.stringify(options.request)
    });

    if (!response.ok) {
        return response;
    }

    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get('content-type') || '';
    return contentType.includes('application/json') ? response.json() : response;
}

async function apiErrorMessage(response, fallback) {
    try {
        const body = await response.clone().json();
        return body.error || body.message || fallback;
    } catch {
        return fallback;
    }
}
