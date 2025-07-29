const socket = io.connect();

window.addEventListener('DOMContentLoaded', async () => {
    const leaderboardList = document.getElementById('leaderboardList');

    // Fetch leaderboard data from the server
    const res = await fetch('https://marketio-3cedad1469b3.herokuapp.com/leaderboard/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    });

    if (res.ok) {
        const data = await res.json();
        data.forEach((entry, index) => {
            const listItem = document.createElement('div');
            listItem.className = 'leaderboard-entry';
            if (index < 3) {
                listItem.classList.add(`rank${index + 1}`);
            }
            listItem.innerHTML = `
                <span class="leaderboard-position">${entry.position}</span>
                <span class="leaderboard-username">${entry.username}</span>
                <span class="leaderboard-balance">£${parseFloat(entry.balance).toFixed(2)}</span>
            `;
            leaderboardList.appendChild(listItem);
        });
    } else {
        console.error('Error fetching leaderboard data:', res.statusText);
    }
});