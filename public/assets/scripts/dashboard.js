import {
    createStockChart,
    updateStockChart
} from './stockChart.js'

import {
    getUserIdFromUrl,
} from './utils.js';

const socket = io.connect();
const renderedHoldings = new Set();
const holdings = {};
const container = document.getElementById('dashboardCards');
const stockCharts = {};
const priceHistory = JSON.parse(localStorage.getItem('priceHistory')) || {};
const labelHistory = JSON.parse(localStorage.getItem('labelHistory')) || {};

window.addEventListener('DOMContentLoaded', async () => {
    const portfolioData = await loadDashboardData('PORTFOLIO_DATA');
    const balanceData = await loadDashboardData('BALANCE_DATA');
    const palData = await loadDashboardData('PAL_DATA');

    document.getElementById('Username').textContent = balanceData.username;

    if (!portfolioData || !portfolioData.details) {
        console.error("Portfolio data not loaded properly.");
        return;
    }

    portfolioData.details.forEach(detail => {
        const symbol = detail.symbol;
        if (!renderedHoldings.has(symbol)) {
            const lastPrice = priceHistory[symbol]?.at(-1) ?? 0;

            const palDetail = palData.details.find(d => d.symbol === symbol);
            const profitLoss = palDetail ? palDetail.profit_loss : 'N/A';
            const avgBuyPrice = palDetail ? palDetail.average_buy_price : 'N/A';

            if (palDetail) {
                holdings[symbol] = {
                    quantity: parseFloat(detail.quantity),
                    avgBuy: parseFloat(avgBuyPrice)
                };
            }

            const stockCanvas = document.createElement('div');
            stockCanvas.className = 'stock-cards';
            stockCanvas.innerHTML = `
                <div class="stock-dashboard-individual">
                    <div class="dashboard-graph">
                        <div class="stock-title">${symbol}</div>
                        <a href="stock-detail.html?symbol=${symbol}" class="stock-link">
                            <div class="stock-price" id="price-${symbol}">£${parseFloat(lastPrice).toFixed(2)}</div>
                            <canvas id="chart-${symbol}" width="400" height="200"></canvas>
                        </a>
                    </div>
                    <div class="detail-dashboard-container">
                        <div class="detail-dashboard-outer-stats">
                            <div class="detail-dashboard-outer">
                                <div class="detail-dashboard">
                                    <h3>Stock P&L</h3>
                                    <p id="pal-${symbol}" class="palDetail">£<span id="pal-${symbol}-detail">${parseFloat(profitLoss).toFixed(2)}</span></p>
                                </div>
                            </div>
                            <div class="detail-dashboard-outer">
                                <div class="detail-dashboard">
                                    <h3>Avg. Buy Price</h3>
                                    <p  id="avg-buy-${symbol}" class="palDetail">£${parseFloat(avgBuyPrice).toFixed(2)}</p>
                                </div>
                            </div>
                            <div class="detail-dashboard-outer">
                                <div class="detail-dashboard" id="stockQuantityHeld${symbol}">
                                </div>
                            </div>
                            <div class="detail-dashboard-outer">
                                <div class="detail-dashboard" id="stockValueHeld${symbol}">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            container.appendChild(stockCanvas);
            renderedHoldings.add(symbol);

            loadDetailFigures();

            const stockCtx = document.getElementById(`chart-${symbol}`).getContext('2d');
            stockCharts[symbol] = createStockChart(stockCtx, symbol);
            stockCharts[symbol].data.labels = labelHistory[symbol] || [];
            stockCharts[symbol].data.datasets[0].data = priceHistory[symbol] || [];
            stockCharts[symbol].update();
        }
    });
});

socket.on('stocks_data', (stocks) => {
    
    stocks.forEach(stock => {
        const {symbol, price} = stock;
        const numPrice = parseFloat(price)
        const label = new Date().toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

        if (!symbol || !price) {
            console.warn(`Invalid stock data received: ${JSON.stringify(stock)}`);
            return; // Skip this stock if data is invalid
        }

        if (!priceHistory[symbol]) priceHistory[symbol] = [];
        if (!labelHistory[symbol]) labelHistory[symbol] = [];

        priceHistory[symbol].push(numPrice);
        labelHistory[symbol].push(label);

        if (priceHistory[symbol].length > 20) {
            //Code to delete bloated pricehistory arrays from testing
            while(priceHistory[symbol].length > 21){
                priceHistory[symbol].shift()
            }
            priceHistory[symbol].shift();
            labelHistory[symbol].shift();
        }

        localStorage.setItem('priceHistory', JSON.stringify(priceHistory));
        localStorage.setItem('labelHistory', JSON.stringify(labelHistory));

        if(renderedHoldings.has(symbol)){
            updateStockChart(stockCharts[symbol], label, numPrice)
            updatePalFigures(symbol, numPrice);
            loadDetailFigures(symbol)
        }
    })
});

// Break down into seperate functions - only call API when necessary - reduce backend load
export async function loadDashboardData(type) {
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

function updatePalFigures(symbol, price) {
    const data = holdings[symbol];
    if (!data) return;

    const {quantity, avgBuy} = data;
    const pnl = (parseFloat(price) - avgBuy) * quantity;

    const palEl = document.getElementById(`pal-${symbol}-detail`);
    const prevPal = parseFloat(palEl.innerText);

    console.log(data, pnl, price, avgBuy, quantity, symbol, prevPal)
    const avgBuyEl = document.getElementById(`avg-buy-${symbol}`);

    if (palEl) palEl.textContent = `${pnl.toFixed(2)}`;
    if (avgBuyEl) avgBuyEl.textContent = `£${avgBuy.toFixed(2)}`;

    flashUpdate(palEl, pnl, prevPal);
}

function flashUpdate(el, value, prevValue) {
    if (!el) return;
    el.style.transition = 'color 0.3s';
    el.style.color = value >= prevValue ? 'green' : 'red';
    setTimeout(() => {
        el.style.color = '';
    }, 800);
}

async function loadDetailFigures() {
    const portfolioData = await loadDashboardData('PORTFOLIO_DATA');

    portfolioData.details.forEach(detail => {
        const { symbol, quantity, current_price, value } = detail;
        const numPrice = parseFloat(current_price);

        let quantityHeld = document.getElementById(`stockQuantityHeld${symbol}`);
        let valueHeld = document.getElementById(`stockValueHeld${symbol}`);

            quantityHeld.innerHTML = `
                <h3>${symbol} Held:</h3>
                <p>${quantity} @ ${numPrice}</p>
            `

            valueHeld.innerHTML = `
                <h3>Total Value Held:</h3>
                <p>£${value}</p>
            `
    })
}
