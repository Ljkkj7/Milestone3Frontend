export function createStockChart(ctx, symbol) {
    const maxPoints = window.innerWidth < 768 ? 5 : 20; // Resize for mobile

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: `${symbol} Stock Price`,
                data: [],
                borderColor: 'white',            // Line color
                backgroundColor: 'white',        // Data point color
                borderWidth: 2,
                fill: false,
                tension: 0.1,
                pointBackgroundColor: 'white',   // Dot fill
                pointBorderColor: 'white',       // Dot outline
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: 'white'           // Legend label color
                    }
                }
            },
            scales: {
                x: {
                    type: 'category',
                    title: {
                        display: true,
                        text: 'Time',
                        color: 'white'           // X axis title color
                    },
                    ticks: {
                        color: 'white'           // X axis tick labels
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'  // Light white grid
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price (GBP)',
                        color: 'white'           // Y axis title color
                    },
                    ticks: {
                        color: 'white'           // Y axis tick labels
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'  // Light white grid
                    },
                    beginAtZero: false
                }
            }
        }
    });

    chart.maxPoints = maxPoints;

    return chart;
}

export function updateStockChart(chart, label, price) {
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(price);

    let cardPrice = document.getElementById(`price-${chart.data.datasets[0].label.split(' ')[0]}`);
    if (cardPrice) {
        cardPrice.textContent = `£${parseFloat(price).toFixed(2)}`;
    } else {
        console.warn(`Price element not found for symbol: ${chart.data.datasets[0].label.split(' ')[0]}`);
    }

    // Limit the number of data points to the last 20 for better performance
    const max = chart.maxPoints || 20;
    if (chart.data.labels.length > max) {    
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }

    // Update the chart
    chart.update();
}