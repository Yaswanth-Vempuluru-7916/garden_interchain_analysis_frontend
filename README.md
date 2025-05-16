# Garden Interchain Analysis

Garden Interchain Analysis is a React-based web application for analyzing interchain transaction data. It provides insights into average durations, individual orders, anomalous orders, and anomaly thresholds for various blockchain chain pairs, with a focus on Bitcoin and non-Bitcoin chains. The app features a date range selector for filtering data and a responsive, user-friendly interface.

## Features

- **Date Range Filtering**: Select start and end dates to fetch transaction data within a specific period.
- **Average Durations**: View average durations for user and Cobi-initiated actions (init, redeem, refund) across chain pairs.
- **Individual Orders**: Display detailed order data, including order IDs, creation times, and durations.
- **Anomalous Orders**: Highlight orders with durations exceeding predefined thresholds.
- **Anomaly Thresholds**: Show upper limits for durations considered anomalous.
- **Bitcoin/Non-Bitcoin Segmentation**: Separate views for Bitcoin-related and other chain pairs.
- **Copy to Clipboard**: Easily copy order IDs for further investigation.
- **Responsive Design**: Tailwind CSS and custom styles ensure a consistent experience across devices.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Custom CSS (for `react-datepicker`)
- **Libraries**: `axios` (API requests), `react-datepicker` (date picker)
- **Backend**: Assumes a REST API (not included) at `VITE_BACKEND_URL`

## Project Structure

```
src/
├── components/
│   ├── common/
│   │   ├── DatePicker.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── SectionHeader.tsx
│   ├── form/
│   │   └── DateRangeForm.tsx
│   ├── tables/
│   │   ├── AverageDurationsTable.tsx
│   │   ├── AnomalyThresholdsTable.tsx
│   │   └── OrdersTable.tsx
├── types/
│   └── index.ts
├── utils/
│   └── index.ts
├── styles/
│   └── datePickerStyles.ts
├── App.tsx
└── index.tsx
```

- **components/**: Reusable UI components, organized by type (common, form, tables).
- **types/**: TypeScript interfaces for API data.
- **utils/**: Utility functions for formatting and filtering data.
- **styles/**: Custom CSS for `react-datepicker`.
- **App.tsx**: Main component orchestrating state and rendering.

## Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Backend API**: A running API server providing endpoints at `/averages`, `/orders/all`, and `/orders/anomalies`.

## Setup

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd garden-interchain-analysis
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file in the root directory and set the backend API URL:
   ```env
   VITE_BACKEND_URL=http://your-backend-api-url
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173` (or another port if specified).

5. **Build for Production**:
   ```bash
   npm run build
   ```
   The output will be in the `dist/` folder.

## Usage

1. **Select Date Range**:
   - Use the "Start Date" and "End Date" pickers to define a time period.
   - Click "Fetch Data" to retrieve data for the selected range.

2. **View Data**:
   - **Average Durations**: Tables showing average durations for chain pairs, split into Bitcoin and non-Bitcoin sections.
   - **Anomalous Orders**: Collapsible sections listing orders with unusual durations.
   - **Anomaly Thresholds**: Tables displaying thresholds for detecting anomalies.
   - **Individual Orders**: Detailed order data, with copyable order IDs.

3. **Interact**:
   - Expand chain pair sections to view orders.
   - Click the copy icon next to an order ID to copy it to the clipboard.

## API Endpoints

The app expects the following backend endpoints:

- **POST `/averages`**:
  - Request: `{ start_time: ISOString, end_time: ISOString }`
  - Response: `{ message: string, last_updated: string, averages: Record<string, DurationData>, thresholds?: Record<string, ThresholdData> }`

- **POST `/orders/all`**:
  - Request: `{ start_time: ISOString, end_time: ISOString }`
  - Response: `{ message: string, orders: Record<string, Order[]> }`

- **POST `/orders/anomalies`**:
  - Request: `{ start_time: ISOString, end_time: ISOString }`
  - Response: `{ message: string, orders: Record<string, Order[]> }`

See `src/types/index.ts` for detailed interface definitions.

## Development

- **Linting**: Run `npm run lint` to check code quality.
- **Formatting**: Use `npm run format` with a formatter like Prettier.
- **Type Checking**: TypeScript ensures type safety; run `npm run typecheck` to verify.

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.


```
