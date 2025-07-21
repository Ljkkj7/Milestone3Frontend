import {
    getUserIdFromUrl,
} from './utils.js';

export async function callAPIs(type) {
    const token = localStorage.getItem('access_token');
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    const API_URLS = getApiUrls();

    let url;
    switch (type) {
        case 'TARGET_USER_DATA':
            url = `${API_URLS.balance}?target_user=${getUserIdFromUrl()}`;
            break;
        case `TARGET_PORTFOLIO_DATA`:
            url = `${API_URLS.portfolio}?target_user=${getUserIdFromUrl()}`;
            break;
        case 'BALANCE_DATA':
            url = API_URLS.balance;
            break;
        case 'PORTFOLIO_DATA':
            url = API_URLS.portfolio;
            break;
        case 'PAL_DATA':
            url = API_URLS.pal;
            break;
        default:
            throw new Error("Invalid data type");
    }

    try {
        const res = await fetch(url, { method: 'GET', headers });
        if (!res.ok) throw new Error(`${type} API error: ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error("Dashboard data fetch failed:", err);
        alert("Failed to load dashboard data: " + err.message);
    }
}

export function getApiUrls() {
    return {
        portfolio: `${window.env.API_BASE_URL}${window.env.API_PORTFOLIO_PATH}`,
        balance: `${window.env.API_BASE_URL}${window.env.API_BALANCE_PATH}`,
        pal: `${window.env.API_BASE_URL}${window.env.API_PAL_PATH}`,
    };
}