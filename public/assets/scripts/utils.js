// Utility functions

// getUserIdFromUrl

export function getUserIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('user'); // returns null if not present
}

//  refreshToken
let tokenRefreshInProgress = false;
export function startTokenRefresh() {
    if (tokenRefreshInProgress) return;
    tokenRefreshInProgress = true;

    const channel = new BroadcastChannel('token_refresh_channel');

    channel.onmessage = (e) => {
        if (e.data === 'refresh_started') {
            console.log('[Utils] Refresh timer started in another tab');
            tokenRefreshInProgress = true;
        }
    }

    channel.postMessage('refresh_started');

    console.log('[Utils] Starting token refresh timer');
    refreshLoop();

    setInterval(refreshLoop, 14 * 60 * 1000); // Refresh every 14 minutes
}

async function refreshLoop() {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
        console.error('[Utils] No refresh token found');
        return;
    }

    try {
        const res = await fetch('https://marketio-3cedad1469b3.herokuapp.com/custom_auth/token/refresh/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh })
        });

        if (!res.ok) throw new Error('Refresh failed');

        const data = await res.json();
        localStorage.setItem('access_token', data.access);
        console.log('[Utils] Access token refreshed at', new Date().toLocaleTimeString());

    } catch (err) {
        console.error('[Utils] Token refresh failed:', err);
        alert('Session expired. Please log in again.');
        window.location.href = 'index.html';
    }
}
