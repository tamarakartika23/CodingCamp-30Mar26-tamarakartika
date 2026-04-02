# Design Document: Transaction Tracker

## Overview

A single-page client-side web app built with HTML, CSS, and Vanilla JavaScript. No build tools, no frameworks, no backend. All state lives in `localStorage` and is rendered on every mutation. Chart.js is loaded via CDN for the pie chart.

The app has one HTML page, one CSS file, and one JS file. All logic — form handling, validation, storage, rendering, and charting — lives in `js/app.js`.

---

## Architecture

```
transaction-tracker/
├── index.html
├── css/
│   └── style.css
└── js/
    └── app.js
```

Data flow is unidirectional:

```
User Action → Validate → Mutate localStorage → Re-render UI (list + balance + chart)
```

On every add or delete, the app reads the full transaction array from `localStorage`, recomputes derived state (balance, category totals), and re-renders all three UI regions. There is no in-memory state separate from `localStorage` — the storage is the source of truth.

On page load, the app reads `localStorage` once and renders the initial state.

---

## Components and Interfaces

### index.html

Defines the static shell:
- `#balance` — balance display element
- `#transaction-form` — input form (name, amount, category select, submit button)
- `#error-msg` — inline validation error container
- `#transaction-list` — scrollable `<ul>` for transaction entries
- `#chart-container` — wrapper for the Chart.js `<canvas>`
- `<canvas id="spending-chart">` — Chart.js target

Chart.js loaded via CDN `<script>` before `app.js`.

### css/style.css

Handles layout (flexbox/grid), scrollable list (`max-height` + `overflow-y: auto`), form styling, error state visibility, and chart container sizing. No logic.

### js/app.js

All application logic. Key functions:

| Function | Responsibility |
|---|---|
| `loadTransactions()` | Read + parse JSON from `localStorage`; return array (empty array on miss/error) |
| `saveTransactions(txns)` | Serialize array to JSON and write to `localStorage`; catch errors and show warning |
| `addTransaction(name, amount, category)` | Validate, build record, append to array, save, re-render |
| `deleteTransaction(id)` | Filter array by id, save, re-render |
| `renderAll()` | Orchestrates `renderList()`, `renderBalance()`, `renderChart()` |
| `renderList(txns)` | Build `<li>` elements for each transaction; show empty-state message when array is empty |
| `renderBalance(txns)` | Sum amounts, update `#balance` text |
| `renderChart(txns)` | Aggregate amounts by category, update or create Chart.js instance |
| `validateForm(name, amount)` | Return error string or null |
| `showError(msg)` / `clearError()` | Toggle `#error-msg` visibility |

Chart instance is held in a module-level variable. On each `renderChart` call, if an instance exists it is destroyed and recreated to avoid Chart.js dataset accumulation issues.

---

## Data Models

### Transaction record (stored in localStorage)

```json
{
  "id": "1718000000000",
  "name": "Coffee",
  "amount": 4.50,
  "category": "Food"
}
```

| Field | Type | Constraints |
|---|---|---|
| `id` | string | `Date.now().toString()` — unique enough for client-side use |
| `name` | string | Non-empty after trim |
| `amount` | number | Positive float |
| `category` | string | One of `"Food"`, `"Transport"`, `"Fun"` |

### localStorage key

```
"transactions"  →  JSON array of Transaction records
```

### Category color map (constant in app.js)

```js
const CATEGORY_COLORS = {
  Food:      "#FF6384",
  Transport: "#36A2EB",
  Fun:       "#FFCE56"
};
```

Colors are fixed constants — same category always maps to the same color.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Valid transaction add persists and renders

*For any* valid transaction (non-empty name, positive amount, valid category), calling `addTransaction` should result in the transaction appearing in the rendered list and in the value returned by `loadTransactions()`.

**Validates: Requirements 1.2**

### Property 2: Invalid input is rejected

*For any* form submission where the name is empty/whitespace or the amount is zero or negative, the transaction array length should remain unchanged after the attempted add.

**Validates: Requirements 1.3**

### Property 3: Post-add UI state is consistent

*For any* valid transaction addition, the form fields should be cleared, the displayed balance should equal the sum of all transaction amounts including the new one, and the chart data should reflect the updated category totals.

**Validates: Requirements 1.4, 4.2, 5.2**

### Property 4: All transactions are fully rendered

*For any* array of transactions in storage, every transaction's name, amount, and category should appear in the rendered transaction list.

**Validates: Requirements 2.1, 2.2**

### Property 5: Every rendered transaction has a delete control

*For any* non-empty transaction list, each rendered `<li>` element should contain a delete button with a reference to that transaction's id.

**Validates: Requirements 3.1**

### Property 6: Delete removes and re-renders consistently

*For any* transaction in the list, activating its delete control should result in that transaction's id no longer appearing in `loadTransactions()`, the rendered list, and the balance and chart should reflect the updated state.

**Validates: Requirements 3.2**

### Property 7: Displayed balance equals sum of amounts

*For any* array of transactions (including the empty array, which yields zero), the text content of `#balance` after `renderBalance` should equal the arithmetic sum of all `amount` fields.

**Validates: Requirements 4.1, 4.3**

### Property 8: Chart data matches per-category sums with consistent colors

*For any* array of transactions, the data passed to Chart.js should have each category's value equal to the sum of amounts for that category, and each category should always map to its fixed color from `CATEGORY_COLORS`.

**Validates: Requirements 5.1, 5.4**

### Property 9: Serialization round-trip preserves records

*For any* valid transaction record, serializing it to JSON and deserializing it back should produce an object with identical `id`, `name`, `amount`, and `category` fields.

**Validates: Requirements 6.2, 6.3, 6.4**

### Property 10: App load renders all stored transactions

*For any* array of transactions written to `localStorage` before page load, calling `loadTransactions()` followed by `renderAll()` should render every stored transaction in the list with correct balance and chart data.

**Validates: Requirements 6.1**

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Empty name or whitespace | Show inline error, block save |
| Amount ≤ 0 or non-numeric | Show inline error, block save |
| `localStorage` write throws | Catch error, display persistent warning banner |
| `localStorage` read returns null | Treat as empty array, render empty state |
| `localStorage` read contains invalid JSON | Catch parse error, treat as empty array, optionally log to console |
| Chart.js not loaded (CDN failure) | Chart section silently absent; list and balance still function |

---

## Testing Strategy

Given the constraint of no test setup, the testing strategy is documentation-oriented — properties are written to be manually verifiable or runnable in a browser console. If a test harness is added later, the properties map directly to test cases.

### Unit tests (manual / console-verifiable)

- Form renders with correct fields (example for Req 1.1)
- Empty state message appears when list is empty (example for Req 2.3)
- Empty state message appears on chart when no transactions (example for Req 5.3)
- Warning message appears when localStorage is mocked to throw (example for Req 6.5)

### Property-based tests (if a test harness is added)

Recommended library: **fast-check** (JavaScript). Each property below maps to one property test with minimum 100 iterations.

| Tag | Property |
|---|---|
| `Feature: browser-local-storage-app, Property 1: valid transaction add persists` | Generate random valid transactions, add each, assert presence in storage and list |
| `Feature: browser-local-storage-app, Property 2: invalid input rejected` | Generate invalid inputs (empty name, non-positive amount), assert array length unchanged |
| `Feature: browser-local-storage-app, Property 3: post-add UI consistency` | Generate valid transaction, add, assert form cleared + balance + chart updated |
| `Feature: browser-local-storage-app, Property 4: all transactions rendered` | Generate random transaction arrays, render, assert all appear in DOM |
| `Feature: browser-local-storage-app, Property 5: delete controls present` | Generate non-empty arrays, render, assert each li has delete button |
| `Feature: browser-local-storage-app, Property 6: delete removes consistently` | Generate array, delete random element, assert removed from storage + DOM + derived state |
| `Feature: browser-local-storage-app, Property 7: balance equals sum` | Generate random amounts, assert displayed balance equals arithmetic sum |
| `Feature: browser-local-storage-app, Property 8: chart data matches category sums` | Generate transactions, assert chart dataset values equal per-category sums and colors match constants |
| `Feature: browser-local-storage-app, Property 9: serialization round-trip` | Generate random valid records, serialize then deserialize, assert field equality |
| `Feature: browser-local-storage-app, Property 10: load renders all stored` | Write transactions to localStorage, call load+render, assert all present |
