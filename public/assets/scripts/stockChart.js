export function createStockChart(ctx, symbol) {
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: `${symbol} Stock Price`,
                
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.1,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'category',
                    title: {
                        display: true,
                        text: 'Time'
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price (USD)'
                    },
                    beginAtZero: false
                }
            }
        }
    });
    
    return chart;
}

export function updateStockChart(chart, label, price) {

    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(price);

    // Limit the number of data points to the last 20 for better performance
    if (chart.data.labels.length > 20) {    
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }

    // Update the chart
    chart.update();
}