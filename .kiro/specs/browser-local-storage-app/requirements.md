# Requirements Document

## Introduction

A client-side Transaction Tracker web app built with HTML, CSS, and Vanilla JavaScript. Users can log transactions with a name, amount, and category, view a running total balance, and visualize spending by category in a pie chart. All data is persisted in the browser's Local Storage — no backend or server required.

## Glossary

- **App**: The Transaction Tracker web application.
- **Transaction**: A single record with an item name, amount, and category.
- **Category**: A label grouping transactions — one of: Food, Transport, or Fun.
- **Transaction_List**: The rendered scrollable list of all logged transactions.
- **Balance**: The sum of all transaction amounts, displayed at the top of the App.
- **Chart**: A pie chart showing spending distribution by category.
- **Local_Storage**: The browser's built-in `localStorage` API used for client-side data persistence.

---

## Requirements

### Requirement 1: Add a Transaction

**User Story:** As a user, I want to log a new transaction with a name, amount, and category, so that I can track my spending.

#### Acceptance Criteria

1. THE App SHALL provide a form with fields for Item Name (text), Amount (numeric), and Category (select: Food, Transport, Fun).
2. WHEN the user submits the form with all fields filled and a valid positive amount, THE App SHALL add the transaction to the Transaction_List and persist it to Local_Storage.
3. WHEN the user submits the form with any field empty or with a non-positive amount, THE App SHALL display an inline validation error and SHALL NOT save the transaction.
4. WHEN a transaction is successfully added, THE App SHALL clear the form fields and update the Balance and Chart immediately.

---

### Requirement 2: View Transaction List

**User Story:** As a user, I want to see a scrollable list of all my logged transactions, so that I can review my spending history.

#### Acceptance Criteria

1. THE App SHALL display all stored transactions in a scrollable Transaction_List.
2. THE Transaction_List SHALL show each transaction's Item Name, Amount, and Category.
3. WHEN the Transaction_List is empty, THE App SHALL display a message indicating no transactions have been logged.

---

### Requirement 3: Delete a Transaction

**User Story:** As a user, I want to delete a transaction I logged by mistake, so that my records stay accurate.

#### Acceptance Criteria

1. THE Transaction_List SHALL display a delete control for each transaction entry.
2. WHEN the user activates the delete control for a transaction, THE App SHALL remove that transaction from Local_Storage and re-render the Transaction_List, Balance, and Chart.

---

### Requirement 4: Total Balance

**User Story:** As a user, I want to see my total balance at the top of the page, so that I know my overall spending at a glance.

#### Acceptance Criteria

1. THE App SHALL display the total Balance (sum of all transaction amounts) at the top of the page.
2. WHEN a transaction is added or deleted, THE App SHALL update the Balance immediately without a page reload.
3. WHEN no transactions are logged, THE App SHALL display a Balance of zero.

---

### Requirement 5: Spending Visualization (Chart)

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can quickly understand where my money is going.

#### Acceptance Criteria

1. THE Chart SHALL render a pie chart showing the spending distribution across Food, Transport, and Fun categories.
2. WHEN expenses are added or deleted, THE App SHALL update the Chart to reflect the current data without a page reload.
3. WHEN no transactions are logged, THE Chart SHALL display an empty state message instead of a blank chart.
4. THE Chart SHALL use distinct, consistent colors per Category.

---

### Requirement 6: Data Persistence

**User Story:** As a user, I want my transactions to be saved between sessions, so that I don't lose my data when I close the browser.

#### Acceptance Criteria

1. WHEN the App loads, THE App SHALL read all transactions from Local_Storage and render them in the Transaction_List, Balance, and Chart.
2. THE App SHALL serialize transaction records as JSON before writing to Local_Storage.
3. THE App SHALL deserialize transaction records from JSON when reading from Local_Storage.
4. FOR ALL valid transaction records, serializing then deserializing SHALL produce an equivalent record (round-trip property).
5. IF Local_Storage is unavailable or throws an error, THEN THE App SHALL display a warning message informing the user that data cannot be saved.
