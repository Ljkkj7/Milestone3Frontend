document.addEventListener('DOMContentLoaded', () => {
    // Get symbol from URL

    const DJANGO_BUY_STOCK = 'https://marketio-3cedad1469b3.herokuapp.com/stocks/buy/';
    const DJANGO_SELL_STOCK = 'https://marketio-3cedad1469b3.herokuapp.com/stocks/sell/';

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
            if (res.ok) {
                alert("Stock bought!")
            }
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}` + (buyData.error));
            }
        } catch(err) {
            alert(err.message);
        }
    }

    sellForm.onsubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('access_token')
        const quantity = parseInt(document.getElementById('sellQuantity').value);
        const quantityHeld = document.getElementById('stockQuantityHeld');
        const valueHeld = document.getElementById('stockValueHeld');

        try {
            const res = await fetch(DJANGO_SELL_STOCK, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ symbol, quantity })
            });

            const sellData = await res.json()
            if (res.ok) {
                alert("Stock sold!")
            }
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}` + (sellData.error));
            }

            quantityHeld.innerHTML = `
                    <h3>${symbol} Held:</h3>
                    <p>${sellData.quantity} @ ${sellData.price}</p>
                `

            valueHeld.innerHTML = `
                    <h3>Total Value Held:</h3>
                    <p>£${sellData.quantity*sellData.price}</p>
                `
        } catch (err) {
            alert (err.message)
        }
    }
})