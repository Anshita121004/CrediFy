document.getElementById("riskForm").addEventListener("submit", function(event) {
    event.preventDefault();

    let data = {
        revenue: document.getElementById("revenue").value,
        loan: document.getElementById("loan").value,
        gst: document.getElementById("gst").value,
        defaults: document.getElementById("defaults").value,
        bank: document.getElementById("bank").value,
        market: document.getElementById("market").value,
        credit: document.getElementById("credit").value
    };

    fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        let riskLevel = result.risk;
        let riskResultSpan = document.getElementById("risk-result");

        // Update result text
        riskResultSpan.innerText = riskLevel;

        // Change color based on risk
        riskResultSpan.style.color = riskLevel === "High Risk" ? "red" : "green";

        updateChart(riskLevel);
    })
    .catch(error => console.error("Error fetching data:", error));
});

let riskChart; // Declare globally to avoid multiple instances

function updateChart(riskLevel) {
    let ctx = document.getElementById("riskChart").getContext("2d");
    
    let riskValue = riskLevel === "High Risk" ? 80 : 20; // Example risk percentage
    let riskColor = riskLevel === "High Risk" ? "red" : "green";

    if (riskChart) {
        riskChart.destroy(); // Destroy previous chart to prevent duplication
    }

    riskChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Risk", "Safe Zone"],
            datasets: [{
                data: [riskValue, 100 - riskValue],
                backgroundColor: [riskColor, "lightgray"],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            cutout: "70%",
            plugins: {
                legend: { display: false }
            }
        }
    });
}

document.getElementById("generateCibil").addEventListener("click", function() {
    let revenue = parseFloat(document.getElementById("revenue").value);
    let loan = parseFloat(document.getElementById("loan").value);
    let gst = parseInt(document.getElementById("gst").value);
    let defaults = parseInt(document.getElementById("defaults").value);
    let bank = { "Low": 0, "Medium": 1, "High": 2 }[document.getElementById("bank").value];
    let market = { "Declining": 0, "Stable": 1, "Growing": 2 }[document.getElementById("market").value];
    let credit = parseFloat(document.getElementById("credit").value);

    let normRevenue = (revenue - 0) / (10000000 - 0);
    let normLoan = (loan - 0) / (5000000 - 0);
    let normGST = gst / 100;
    let normDefaults = 1 - (defaults / 10);
    let normBank = bank / 2;
    let normMarket = market / 2;
    let normCredit = (credit - 300) / 600;

    let weightedScore = (0.15 * normRevenue) +
                        (0.15 * (1 - normLoan)) +
                        (0.10 * normGST) +
                        (0.25 * normDefaults) +
                        (0.10 * normBank) +
                        (0.10 * normMarket) +
                        (0.15 * normCredit);

    let finalScore = 300 + (weightedScore * 600);
    document.getElementById("cibil-result").innerText = Math.round(finalScore);
});