

document.getElementById('registerForm').onsubmit = async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;

    try {
        const res = await fetch('https://marketio-3cedad1469b3.herokuapp.com/custom_auth/register/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            alert("User registered");
        } else {
            alert("Error: " + (data.detail || JSON.stringify(data)));
        }
    } catch(err) {
        alert("Request failed: " + err.message);
    }
}

document.getElementById('loginForm').onsubmit = async (e) => {
    e.preventDefault();

    const navLinksToggle = document.getElementsByClassName('loggedIn');
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const res = await fetch('https://marketio-3cedad1469b3.herokuapp.com/custom_auth/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            alert("Login successful");
            window.location.href = 'market.html';
        } else {
            alert("Error: " + (data.detail || JSON.stringify(data)));
        }
    } catch(err) {
        alert("Request failed: " + err.message);
    }
}