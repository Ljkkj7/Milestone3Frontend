export function parseJwt(token) {
    if (!token) return null;

    try {
        // 1. Split the token and grab the payload (2nd part)
        const base64Url = token.split('.')[1];

        // 2. Replace URL-safe characters to regular Base64
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

        // 3. Decode Base64 → JSON string
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        // 4. Parse JSON string to object
        return JSON.parse(jsonPayload);

    } catch (err) {
        console.error('JWT parse error:', err);
        return null;
    }
}

// Function to set the profile link in the navigation bar
function setProfileNavLink() {
    const accessToken = localStorage.getItem('access_token');
    const payload = parseJwt(accessToken);
    const userId = payload?.user_id;

    const profileLink = document.querySelector('a[href="profile.html"]');
    if (profileLink && userId) {
        profileLink.href = `profile.html?user=${userId}`;
    }
}

// Run on DOM ready
document.addEventListener('DOMContentLoaded', setProfileNavLink);