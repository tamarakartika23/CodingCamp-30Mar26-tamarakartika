# Implementation Plan: Transaction Tracker

## Overview

Build a single-page client-side Transaction Tracker using HTML, CSS, and Vanilla JavaScript. All logic lives in `js/app.js`, state is persisted in `localStorage`, and Chart.js is loaded via CDN.

## Tasks

- [x] 1. Scaffold project structure and static HTML shell
  - Create `index.html` with all required element IDs: `#balance`, `#transaction-form`, `#error-msg`, `#transaction-list`, `#chart-container`, and `<canvas id="spending-chart">`
  - Add form fields: Item Name (text input), Amount (number input), Category (select with Food/Transport/Fun options), and a submit button
  - Load Chart.js via CDN `<script>` tag before `app.js`
  - Create empty `css/style.css` and `js/app.js` files and link them in `index.html`
  - _Requirements: 1.1_

- [x] 2. Implement localStorage storage layer
  - [x] 2.1 Implement `loadTransactions()` and `saveTransactions(txns)` in `js/app.js`
    - `loadTransactions()` reads and JSON-parses the `"transactions"` key; returns empty array on null or parse error
    - `saveTransactions(txns)` serializes to JSON and writes to `localStorage`; catches write errors and calls `showError` with a warning
    - Define the `CATEGORY_COLORS` constant: `{ Food: "#FF6384", Transport: "#36A2EB", Fun: "#FFCE56" }`
    - _Requirements: 6.2, 6.3, 6.5_

  - [ ]* 2.2 Write property test for serialization round-trip
    - **Property 9: Serialization round-trip preserves records**
    - **Validates: Requirements 6.2, 6.3, 6.4**

- [x] 3. Implement form validation and error display
  - [x] 3.1 Implement `validateForm(name, amount)`, `showError(msg)`, and `clearError()` in `js/app.js`
    - `validateForm` returns an error string if name is empty/whitespace or amount is ≤ 0 or non-numeric; returns null on valid input
    - `showError` sets `#error-msg` text content and makes it visible; `clearError` hides it
    - _Requirements: 1.3_

  - [ ]* 3.2 Write property test for invalid input rejection
    - **Property 2: Invalid input is rejected**
    - **Validates: Requirements 1.3**

- [x] 4. Implement transaction list rendering
  - [x] 4.1 Implement `renderList(txns)` in `js/app.js`
    - Clear `#transaction-list` and rebuild `<li>` elements for each transaction showing name, amount, and category
    - Each `<li>` must include a delete button with a `data-id` attribute set to the transaction's id
    - When `txns` is empty, render a single `<li>` with an empty-state message
    - _Requirements: 2.1, 2.2, 2.3, 3.1_

  - [ ]* 4.2 Write property test for full list rendering
    - **Property 4: All transactions are fully rendered**
    - **Validates: Requirements 2.1, 2.2**

  - [ ]* 4.3 Write property test for delete controls
    - **Property 5: Every rendered transaction has a delete control**
    - **Validates: Requirements 3.1**

- [x] 5. Implement balance rendering
  - [x] 5.1 Implement `renderBalance(txns)` in `js/app.js`
    - Sum all `amount` fields and update `#balance` text content; display zero when array is empty
    - _Requirements: 4.1, 4.3_

  - [ ]* 5.2 Write property test for balance calculation
    - **Property 7: Displayed balance equals sum of amounts**
    - **Validates: Requirements 4.1, 4.3**

- [x] 6. Implement chart rendering
  - [x] 6.1 Implement `renderChart(txns)` in `js/app.js`
    - Aggregate amounts by category using `CATEGORY_COLORS` keys
    - Destroy existing Chart.js instance (module-level variable) if present, then create a new pie chart on `#spending-chart`
    - When `txns` is empty, hide the canvas and show an empty-state message in `#chart-container`; otherwise show the canvas
    - _Requirements: 5.1, 5.3, 5.4_

  - [ ]* 6.2 Write property test for chart data correctness
    - **Property 8: Chart data matches per-category sums with consistent colors**
    - **Validates: Requirements 5.1, 5.4**

- [x] 7. Implement add and delete transaction logic
  - [x] 7.1 Implement `addTransaction(name, amount, category)` in `js/app.js`
    - Validate inputs via `validateForm`; show error and return early on failure
    - Build a transaction record with `id: Date.now().toString()`, name, amount as float, and category
    - Append to loaded array, save, clear error, clear form fields, call `renderAll()`
    - _Requirements: 1.2, 1.4_

  - [ ]* 7.2 Write property test for valid transaction add
    - **Property 1: Valid transaction add persists and renders**
    - **Validates: Requirements 1.2**

  - [ ]* 7.3 Write property test for post-add UI consistency
    - **Property 3: Post-add UI state is consistent**
    - **Validates: Requirements 1.4, 4.2, 5.2**

  - [x] 7.4 Implement `deleteTransaction(id)` in `js/app.js`
    - Filter the loaded array to remove the record with matching id, save, call `renderAll()`
    - _Requirements: 3.2_

  - [ ]* 7.5 Write property test for delete consistency
    - **Property 6: Delete removes and re-renders consistently**
    - **Validates: Requirements 3.2**

- [x] 8. Wire form submission, delete events, and page load
  - [x] 8.1 Implement `renderAll()` and attach all event listeners in `js/app.js`
    - `renderAll()` calls `loadTransactions()` then `renderList()`, `renderBalance()`, `renderChart()` in sequence
    - Attach `submit` listener on `#transaction-form` that calls `addTransaction` with form field values
    - Attach delegated `click` listener on `#transaction-list` that calls `deleteTransaction` when a delete button is clicked
    - Call `renderAll()` on `DOMContentLoaded` to hydrate UI from storage on page load
    - _Requirements: 1.2, 1.4, 3.2, 4.2, 5.2, 6.1_

  - [ ]* 8.2 Write property test for page load rendering
    - **Property 10: App load renders all stored transactions**
    - **Validates: Requirements 6.1**

- [x] 9. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Style the app with CSS
  - [x] 10.1 Implement layout and base styles in `css/style.css`
    - Use flexbox or grid for overall page layout
    - Style the form, inputs, select, and submit button
    - Make `#transaction-list` scrollable with `max-height` and `overflow-y: auto`
    - Size `#chart-container` and `<canvas>` appropriately
    - Style the error message (`#error-msg`) as hidden by default; visible class shows it
    - Style delete buttons inline within each list item
    - _Requirements: 1.1, 2.1, 5.1_

- [x] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implement custom categories
  - [x] 12.1 Add `#custom-category-form`, `#custom-category-input`, `#category-error-msg` to `index.html`; update the category `<select>` to be dynamically populated
    - _Requirements: 7.1, 7.5_

  - [x] 12.2 Implement `loadCategories()`, `saveCategories(cats)`, `addCustomCategory(name)`, `renderCategoryOptions()`, and `getCategoryColor(name)` in `js/app.js`
    - `loadCategories()` reads and JSON-parses the `"categories"` key; returns empty array on null or parse error
    - `saveCategories(cats)` serializes custom categories array to JSON and writes to `localStorage`
    - `addCustomCategory(name)` validates (non-empty, unique), appends to custom categories, saves, calls `renderCategoryOptions()`
    - `renderCategoryOptions()` rebuilds `<option>` elements in the category `<select>` from built-in + custom categories
    - `getCategoryColor(name)` returns fixed color for built-in categories; for custom categories, returns a deterministic color from `CUSTOM_PALETTE` based on the category's index in the full list
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [ ]* 12.3 Write property test for Property 11: Custom category persists and appears in selector
    - **Property 11: Custom category persists and appears in selector**
    - **Validates: Requirements 7.2, 7.4, 7.5, 7.6**

  - [ ]* 12.4 Write property test for Property 12: Custom category color is consistent
    - **Property 12: Custom category color is consistent**
    - **Validates: Requirements 7.7, 5.4**

- [x] 13. Implement monthly summary view
  - [x] 13.1 Add `#monthly-summary` section to `index.html`
    - _Requirements: 8.1_

  - [x] 13.2 Implement `renderMonthlySummary(txns)` in `js/app.js`
    - Group transactions by calendar month+year, compute total spending and per-category breakdowns for each group
    - Render groups into `#monthly-summary` in reverse chronological order (most recent first)
    - Show empty-state message when array is empty
    - Update `renderAll()` to call `renderMonthlySummary`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [ ]* 13.3 Write property test for Property 13: Monthly summary totals match transaction sums
    - **Property 13: Monthly summary totals match transaction sums**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.7**

- [x] 14. Implement dark/light mode toggle
  - [x] 14.1 Add `#theme-toggle` button to `index.html`
    - _Requirements: 9.1_

  - [x] 14.2 Implement `loadTheme()`, `saveTheme(theme)`, and `applyTheme(theme)` in `js/app.js`
    - `loadTheme()` reads theme preference from `localStorage`; returns `"light"` if missing or invalid
    - `saveTheme(theme)` writes theme string (`"light"` or `"dark"`) to `localStorage`
    - `applyTheme(theme)` sets or removes `data-theme="dark"` on `<html>`
    - Call `applyTheme(loadTheme())` before `renderAll()` on `DOMContentLoaded`
    - Attach click listener on `#theme-toggle` to toggle between `"light"` and `"dark"`, calling `applyTheme` and `saveTheme`
    - _Requirements: 9.2, 9.3, 9.4, 9.5_

  - [x] 14.3 Add CSS custom properties for light and dark themes in `css/style.css`
    - Define CSS variables for colors, backgrounds, and text under `:root` (light defaults) and `[data-theme="dark"]` selector
    - Ensure sufficient contrast for all text and interactive elements in both themes
    - _Requirements: 9.6, 9.7_

  - [ ]* 14.4 Write property test for Property 14: Theme preference persists and applies on load
    - **Property 14: Theme preference persists and applies on load**
    - **Validates: Requirements 9.2, 9.3, 9.4, 9.5**

- [x] 15. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
