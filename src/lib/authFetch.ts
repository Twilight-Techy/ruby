/**
 * A wrapper around `fetch` that automatically redirects to /login
 * if the server returns a 401 Unauthorized response.
 * Use this for all authenticated client-side API calls.
 */
export async function authFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const res = await fetch(input, init);
    if (res.status === 401) {
        window.location.href = '/login';
        // Return a never-resolving promise to stop execution
        return new Promise(() => { });
    }
    return res;
}
