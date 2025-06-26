document.addEventListener('DOMContentLoaded', () => {
    // Get symbol from URL

    const params = new URLSearchParams(window.location.search);
    const symbol = params.get('symbol');

    const buyForm = document.getElementById('buyForm');
    const sellForm = document.getElementById('sellForm');

    if (!buyForm || !sellForm) {
        console.error("Form not found!")
        return;
    }

    buyForm.onsubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('access_token')
        const quantity = parseInt(document.getElementById('buyQuantity').value);

        try {
            const res = await fetch(DJANGO_BUY_STOCK, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ symbol, quantity })
            });

            const buyData = await res.json()
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}` + (buyData.error));
            }
        } catch(err) {
            alert(err.message);
        }
    }
})