// app.js - Transaction Tracker

const STORAGE_KEY = "transactions";
const CATEGORIES_KEY = "categories";

const BUILT_IN_CATEGORIES = ["Food", "Transport", "Fun"];

const CATEGORY_COLORS = {
  Food: "#FF6384",
  Transport: "#36A2EB",
  Fun: "#FFCE56"
};

const CUSTOM_PALETTE = [
  "#4BC0C0", "#9966FF", "#FF9F40", "#C9CBCF", "#E7E9ED", "#71B37C"
];

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

function loadCategories() {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (raw === null) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveCategories(cats) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
}

function getCategoryColor(name) {
  if (CATEGORY_COLORS[name] !== undefined) {
    return CATEGORY_COLORS[name];
  }
  const customCats = loadCategories();
  const allCats = BUILT_IN_CATEGORIES.concat(customCats);
  const index = allCats.indexOf(name);
  return CUSTOM_PALETTE[index % CUSTOM_PALETTE.length];
}

function renderCategoryOptions() {
  const select = document.getElementById("category");
  const customCats = loadCategories();
  const allCats = BUILT_IN_CATEGORIES.concat(customCats);
  select.innerHTML = "";
  allCats.forEach(function(cat) {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

function addCustomCategory(name) {
  const trimmed = name ? name.trim() : "";
  const errorEl = document.getElementById("category-error-msg");

  if (!trimmed) {
    errorEl.textContent = "Category name cannot be empty.";
    errorEl.classList.add("visible");
    return;
  }

  const customCats = loadCategories();
  const allCats = BUILT_IN_CATEGORIES.concat(customCats);
  if (allCats.map(function(c) { return c.toLowerCase(); }).indexOf(trimmed.toLowerCase()) !== -1) {
    errorEl.textContent = "Category already exists.";
    errorEl.classList.add("visible");
    return;
  }

  errorEl.textContent = "";
  errorEl.classList.remove("visible");

  customCats.push(trimmed);
  saveCategories(customCats);
  renderCategoryOptions();
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
  const customCats = loadCategories();
  const allCats = BUILT_IN_CATEGORIES.concat(customCats);
  const totals = {};
  allCats.forEach(function(cat) {
    totals[cat] = 0;
  });
  txns.forEach(function(txn) {
    if (totals[txn.category] !== undefined) {
      totals[txn.category] += parseFloat(txn.amount);
    } else {
      totals[txn.category] = parseFloat(txn.amount);
    }
  });

  const labels = Object.keys(totals).filter(function(cat) { return totals[cat] > 0; });
  const data = labels.map(function(cat) { return totals[cat]; });
  const colors = labels.map(function(cat) { return getCategoryColor(cat); });

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

function renderMonthlySummary(txns) {
  const container = document.getElementById("monthly-summary");
  // Remove all children except the heading
  const heading = container.querySelector("h2");
  container.innerHTML = "";
  if (heading) container.appendChild(heading);

  if (txns.length === 0) {
    const msg = document.createElement("p");
    msg.className = "monthly-empty-msg";
    msg.textContent = "No data available.";
    container.appendChild(msg);
    return;
  }

  // Group transactions by "YYYY-MM" key derived from the id timestamp
  const groups = {};
  txns.forEach(function(txn) {
    const date = new Date(parseInt(txn.id, 10));
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed
    const key = year + "-" + String(month + 1).padStart(2, "0");
    if (!groups[key]) {
      groups[key] = { year: year, month: month, txns: [] };
    }
    groups[key].txns.push(txn);
  });

  // Sort keys in reverse chronological order (most recent first)
  const sortedKeys = Object.keys(groups).sort(function(a, b) {
    return b.localeCompare(a);
  });

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  sortedKeys.forEach(function(key) {
    const group = groups[key];
    const monthLabel = MONTH_NAMES[group.month] + " " + group.year;

    // Compute total and per-category breakdown
    const total = group.txns.reduce(function(sum, txn) {
      return sum + parseFloat(txn.amount);
    }, 0);

    const catTotals = {};
    group.txns.forEach(function(txn) {
      if (!catTotals[txn.category]) catTotals[txn.category] = 0;
      catTotals[txn.category] += parseFloat(txn.amount);
    });

    // Build DOM for this month group
    const section = document.createElement("div");
    section.className = "monthly-group";

    const title = document.createElement("h3");
    title.textContent = monthLabel;
    section.appendChild(title);

    const totalEl = document.createElement("p");
    totalEl.className = "monthly-total";
    totalEl.textContent = "Total: $" + total.toFixed(2);
    section.appendChild(totalEl);

    const breakdown = document.createElement("ul");
    breakdown.className = "monthly-breakdown";
    Object.keys(catTotals).forEach(function(cat) {
      const li = document.createElement("li");
      li.textContent = cat + ": $" + catTotals[cat].toFixed(2);
      breakdown.appendChild(li);
    });
    section.appendChild(breakdown);

    container.appendChild(section);
  });
}

function loadTheme() {
  const val = localStorage.getItem("theme");
  return (val === "light" || val === "dark") ? val : "light";
}

function saveTheme(theme) {
  localStorage.setItem("theme", theme);
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  const checkbox = document.getElementById("theme-toggle");
  if (checkbox) {
    checkbox.checked = (theme === "dark");
  }
}

function renderAll() {
  const txns = loadTransactions();
  renderCategoryOptions();
  renderList(txns);
  renderBalance(txns);
  renderChart(txns);
  renderMonthlySummary(txns);
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

// Custom category form submission
document.getElementById("custom-category-form").addEventListener("submit", function(e) {
  e.preventDefault();
  const input = document.getElementById("custom-category-input");
  addCustomCategory(input.value);
  input.value = "";
});

// Theme toggle
document.getElementById("theme-toggle").addEventListener("change", function() {
  const next = this.checked ? "dark" : "light";
  applyTheme(next);
  saveTheme(next);
});

// Hydrate UI on page load
document.addEventListener("DOMContentLoaded", function() {
  applyTheme(loadTheme());
  renderAll();
});
