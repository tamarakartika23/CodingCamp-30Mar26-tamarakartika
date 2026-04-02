// app.js - Transaction Tracker

const STORAGE_KEY = "transactions";

const CATEGORY_COLORS = {
  Food: "#FF6384",
  Transport: "#36A2EB",
  Fun: "#FFCE56"
};

let chartInstance = null;

function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveTransactions(txns) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(txns));
  } catch (e) {
    showError("Warning: data could not be saved to local storage.");
  }
}

function validateForm(name, amount) {
  if (!name || name.trim() === "") {
    return "Item name is required.";
  }
  const parsed = parseFloat(amount);
  if (isNaN(parsed) || parsed <= 0) {
    return "Amount must be a positive number.";
  }
  return null;
}

function showError(msg) {
  const el = document.getElementById("error-msg");
  el.textContent = msg;
  el.classList.add("visible");
}

function clearError() {
  const el = document.getElementById("error-msg");
  el.textContent = "";
  el.classList.remove("visible");
}

function renderList(txns) {
  const ul = document.getElementById("transaction-list");
  ul.innerHTML = "";

  if (txns.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No transactions logged yet.";
    ul.appendChild(li);
    return;
  }

  txns.forEach(function(txn) {
    const li = document.createElement("li");
    li.innerHTML =
      "<span class=\"txn-name\">" + txn.name + "</span>" +
      "<span class=\"txn-amount\">$" + parseFloat(txn.amount).toFixed(2) + "</span>" +
      "<span class=\"txn-category\">" + txn.category + "</span>" +
      "<button class=\"delete-btn\" data-id=\"" + txn.id + "\">Delete</button>";
    ul.appendChild(li);
  });
}

function renderBalance(txns) {
  const total = txns.reduce(function(sum, txn) {
    return sum + parseFloat(txn.amount);
  }, 0);
  document.getElementById("balance").textContent = total.toFixed(2);
}

function renderChart(txns) {
  const canvas = document.getElementById("spending-chart");
  const container = document.getElementById("chart-container");

  // Destroy existing chart instance to avoid dataset accumulation
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  if (txns.length === 0) {
    canvas.style.display = "none";
    // Show empty-state message if not already present
    let emptyMsg = container.querySelector(".chart-empty-msg");
    if (!emptyMsg) {
      emptyMsg = document.createElement("p");
      emptyMsg.className = "chart-empty-msg";
      emptyMsg.textContent = "No spending data to display.";
      container.appendChild(emptyMsg);
    }
    return;
  }

  // Remove empty-state message if present
  const emptyMsg = container.querySelector(".chart-empty-msg");
  if (emptyMsg) {
    emptyMsg.remove();
  }
  canvas.style.display = "";

  // Aggregate amounts by category
  const totals = {};
  Object.keys(CATEGORY_COLORS).forEach(function(cat) {
    totals[cat] = 0;
  });
  txns.forEach(function(txn) {
    if (totals[txn.category] !== undefined) {
      totals[txn.category] += parseFloat(txn.amount);
    }
  });

  const labels = Object.keys(CATEGORY_COLORS);
  const data = labels.map(function(cat) { return totals[cat]; });
  const colors = labels.map(function(cat) { return CATEGORY_COLORS[cat]; });

  chartInstance = new Chart(canvas, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors
      }]
    },
    options: {
      responsive: true
    }
  });
}

function addTransaction(name, amount, category) {
  const error = validateForm(name, amount);
  if (error) {
    showError(error);
    return;
  }

  const txns = loadTransactions();
  txns.push({
    id: Date.now().toString(),
    name: name,
    amount: parseFloat(amount),
    category: category
  });
  saveTransactions(txns);

  clearError();

  // Clear form fields
  document.getElementById("item-name").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("category").selectedIndex = 0;

  renderAll();
}

function deleteTransaction(id) {
  const txns = loadTransactions().filter(function(txn) {
    return txn.id !== id;
  });
  saveTransactions(txns);
  renderAll();
}

function renderAll() {
  const txns = loadTransactions();
  renderList(txns);
  renderBalance(txns);
  renderChart(txns);
}

// Form submission
document.getElementById("transaction-form").addEventListener("submit", function(e) {
  e.preventDefault();
  const name = document.getElementById("item-name").value;
  const amount = document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  addTransaction(name, amount, category);
});

// Delegated delete click
document.getElementById("transaction-list").addEventListener("click", function(e) {
  if (e.target.classList.contains("delete-btn")) {
    deleteTransaction(e.target.dataset.id);
  }
});

// Hydrate UI on page load
document.addEventListener("DOMContentLoaded", renderAll);
