import { useState, useEffect, type FormEvent } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Define interfaces for API data
interface DurationData {
  total_orders: number;
  avg_user_init_duration: number | null;
  avg_cobi_init_duration: number | null;
  avg_user_redeem_duration: number | null;
  avg_cobi_redeem_duration: number | null;
  avg_user_refund_duration: number | null;
  avg_cobi_refund_duration: number | null;
}

interface Order {
  create_order_id: string;
  created_at: string;
  durations: {
    user_init_duration: number | null;
    cobi_init_duration: number | null;
    user_redeem_duration: number | null;
    cobi_redeem_duration: number | null;
    user_refund_duration: number | null;
    cobi_refund_duration: number | null;
    overall_duration: number | null;
  };
}

interface ThresholdData {
  user_init_duration: { upper: number | null };
  cobi_init_duration: { upper: number | null };
  user_redeem_duration: { upper: number | null };
  cobi_redeem_duration: { upper: number | null };
}

interface AveragesResponse {
  message: string;
  last_updated: string;
  averages: Record<string, DurationData>;
  thresholds?: Record<string, ThresholdData>;
}

interface OrdersResponse {
  message: string;
  orders: Record<string, Order[]>;
  anomalies?: Record<string, ThresholdData>;
}

const apiUrl = import.meta.env.VITE_BACKEND_URL;

const App = () => {
  const [startTime, setStartTime] = useState<Date | null>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  });
  const [endTime, setEndTime] = useState<Date | null>(new Date());
  const [averagesData, setAveragesData] = useState<AveragesResponse['averages'] | null>(null);
  const [ordersData, setOrdersData] = useState<OrdersResponse['orders'] | null>(null);
  const [anomalyOrdersData, setAnomalyOrdersData] = useState<OrdersResponse['orders'] | null>(null);
  const [anomaliesData, setAnomaliesData] = useState<AveragesResponse['thresholds'] | null>(null);
  const [lastUpdated, setLastUpdated] = useState('');
  const [error, setError] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  // const [isSyncing, setIsSyncing] = useState(false); // New state for syncing
  // const [syncMessage, setSyncMessage] = useState(''); // New state for sync feedback
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  const fetchData = async () => {
    const isValidDate = (date: Date | null) => date === null || !isNaN(date.getTime());
    if ((startTime && !isValidDate(startTime)) || (endTime && !isValidDate(endTime))) {
      setError('Invalid date format');
      return;
    }

    setIsFetching(true);
    setAveragesData(null);
    setOrdersData(null);
    setAnomalyOrdersData(null);
    setAnomaliesData(null);
    setError('');

    try {
      const [averagesResponse, ordersResponse, anomalyOrdersResponse] = await Promise.all([
        axios.post<AveragesResponse>(`${apiUrl}/averages`, {
          start_time: startTime ? startTime.toISOString() : undefined,
          end_time: endTime ? endTime.toISOString() : undefined,
        }),
        axios.post<OrdersResponse>(`${apiUrl}/orders/all`, {
          start_time: startTime ? startTime.toISOString() : undefined,
          end_time: endTime ? endTime.toISOString() : undefined,
        }),
        axios.post<OrdersResponse>(`${apiUrl}/orders/anomalies`, {
          start_time: startTime ? startTime.toISOString() : undefined,
          end_time: endTime ? endTime.toISOString() : undefined,
        }),
      ]);

      setAveragesData(averagesResponse.data.averages);
      setOrdersData(ordersResponse.data.orders);
      setAnomalyOrdersData(anomalyOrdersResponse.data.orders);
      setAnomaliesData(averagesResponse.data.thresholds || {});
      setLastUpdated(averagesResponse.data.last_updated);
      setError('');
      if (!averagesResponse.data.thresholds) {
        console.warn('No anomalies field in averages response');
      }
    } catch (err: any) {
      setError('Failed to fetch data from backend: ' + err.message);
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  // // New function to handle sync orders
  // const handleSyncOrders = async () => {
  //   setIsSyncing(true);
  //   setSyncMessage('');
  //   setError('');

  //   try {
  //     await axios.post(`${apiUrl}/sync`);
  //     setSyncMessage('Orders synced successfully. Timestamps are being updated in the background.');
  //     await fetchData(); // Refresh data immediately after sync
  //   } catch (err) {
  //     setError('Failed to sync orders');
  //     console.error('Sync error:', err);
  //   } finally {
  //     setIsSyncing(false);
  //   }
  // };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const formatDecimal = (value: number | null): string => {
    if (value === null) return 'N/A';
    if (value > 3600) {
      const hours = value / 3600;
      return `${hours.toFixed(2)}hr`;
    } else if (value > 60) {
      const minutes = value / 60;
      return `${minutes.toFixed(2)}min`;
    }
    return `${value.toFixed(2)}s`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(text);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  // Filter chain pairs for Bitcoin-related and non-Bitcoin
  const isBitcoinChainPair = (chainPair: string) => chainPair.toLowerCase().includes('bitcoin');
  const getBitcoinChainPairs = (data: Record<string, any> | null) =>
    data ? Object.keys(data).filter(isBitcoinChainPair) : [];
  const getNonBitcoinChainPairs = (data: Record<string, any> | null) =>
    data ? Object.keys(data).filter((chainPair) => !isBitcoinChainPair(chainPair)) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E0F5F5] to-[#A7E4E0] p-8 text-gray-800 font-sans">
      <style>
        {`
          .react-datepicker-popper {
            z-index: 9999 !important;
          }
          .react-datepicker {
            font-family: sans-serif !important;
            border: 1px solid #d1d5db !important;
            border-radius: 0.5rem !important;
            background-color: white !important;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
          }
          .react-datepicker__input-container input {
            width: 100%;
            background-color: white;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            padding: 0.75rem;
            color: #1f2937;
            transition: all 0.3s;
          }
          .react-datepicker__input-container input:focus {
            border-color: #F06292;
            outline: none;
            box-shadow: 0 0 0 2px rgba(240, 98, 146, 0.3);
          }
          .react-datepicker__header {
            background-color: #F06292 !important;
            border-bottom: none !important;
            color: white !important;
            padding: 0.5rem !important;
          }
          .react-datepicker__day-name,
          .react-datepicker__day,
          .react-datepicker__time-list-item {
            color: #1f2937 !important;
          }
          .react-datepicker__day--selected,
          .react-datepicker__day--keyboard-selected,
          .react-datepicker__time-list-item--selected {
            background-color: #F06292 !important;
            color: white !important;
            border-radius: 0.25rem !important;
          }
          .react-datepicker__day:hover,
          .react-datepicker__time-list-item:hover {
            background-color: #f0f0f0 !important;
            border-radius: 0.25rem !important;
          }
          .react-datepicker__time-container {
            border-left: 1px solid #d1d5db !important;
          }
          .react-datepicker__time-list {
            background-color: white !important;
          }
          .react-datepicker__navigation-icon::before {
            border-color: white !important;
          }
          .react-datepicker__current-month,
          .react-datepicker-time__header {
            color: white !important;
          }
        `}
      </style>
      <div id="portal">
        <div className="max-w-7xl mx-auto mb-10 bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-gray-200/50">
          <h1 className="text-4xl font-bold mb-6 text-gray-800 drop-shadow-lg">Garden Interchain Analysis</h1>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-6 items-end mb-6">
            <div className="flex flex-col flex-1">
              <label className="text-sm font-medium text-gray-600 mb-2">Start Date</label>
              <DatePicker
                selected={startTime}
                onChange={(date: Date | null) => setStartTime(date || new Date())}
                dateFormat="yyyy-MM-dd"
                timeFormat="HH:mm"
                maxDate={new Date()}
                portalId="portal"
                placeholderText="Select start date and time"
              />
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-sm font-medium text-gray-600 mb-2">End Date</label>
              <DatePicker
                selected={endTime}
                onChange={(date: Date | null) => setEndTime(date || new Date())}
                dateFormat="yyyy-MM-dd"
                timeFormat="HH:mm"
                maxDate={new Date()}
                portalId="portal"
                placeholderText="Select end date and time"
              />
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-sm font-medium text-gray-600 mb-2">Last Updated</label>
              <span className="w-full bg-white/70 border border-gray-300 rounded-lg p-3 text-gray-600">
                {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                className="bg-[#F06292] hover:bg-[#F06292]/80 text-white font-bold py-3 px-8 rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg cursor-pointer"
              >
                Fetch Data
              </button>
            {/* <button
              type="button"
              onClick={handleSyncOrders}
              disabled={isSyncing}
              className={`bg-[#4CAF50] hover:bg-[#4CAF50]/80 text-white font-bold py-3 px-8 rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg cursor-pointer ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSyncing ? 'Syncing...' : 'Fetch Latest Orders'}
            </button> */}
            </div>
          </form>

          {error && (
            <div className="text-red-600 bg-red-100/50 border border-red-300 p-4 rounded-lg animate-pulse">{error}</div>
          )}
        {/* {syncMessage && (
          <div className="text-green-600 bg-green-100/50 border border-green-300 p-4 rounded-lg animate-pulse">{syncMessage}</div>
        )} */}
        </div>


        {/* Average Durations (Non-Bitcoin) */}
        <div className="max-w-7xl mx-auto mb-12">
          <h2 className="text-2xl font-bold mb-6 inline-block border-b-2 border-[#F06292] pb-2 text-gray-800">Average Durations</h2>
          {isFetching ? (
            <div className="text-gray-600 text-center mt-8 animate-pulse">Fetching chains...</div>
          ) : (
            averagesData ? (
              <div className="overflow-x-auto rounded-xl backdrop-blur bg-white/90 border border-gray-200/50 shadow-lg">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-800 shadow-md">
                      <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100">Chain Pair</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100">Total Orders</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100">User Init</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100">Cobi Init</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100">User Redeem</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100">Cobi Redeem</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100">User Refund</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100">Cobi Refund</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getNonBitcoinChainPairs(averagesData)
                      .filter((chainPair) => averagesData[chainPair].total_orders > 0)
                      .map((chainPair, idx) => (
                        <tr key={chainPair} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-all duration-300 shadow-sm`}>
                          <td className="py-4 px-6 border-b border-gray-200 font-medium text-gray-800">{chainPair}</td>
                          <td className="py-4 px-6 border-b border-gray-200 text-[#F06292] font-semibold">{averagesData[chainPair].total_orders}</td>
                          <td className="py-4 px-6 border-b border-gray-200 text-gray-700">{formatDecimal(averagesData[chainPair].avg_user_init_duration)}</td>
                          <td className="py-4 px-6 border-b border-gray-200 text-gray-700">{formatDecimal(averagesData[chainPair].avg_cobi_init_duration)}</td>
                          <td className="py-4 px-6 border-b border-gray-200 text-gray-700">{formatDecimal(averagesData[chainPair].avg_user_redeem_duration)}</td>
                          <td className="py-4 px-6 border-b border-gray-200 text-gray-700">{formatDecimal(averagesData[chainPair].avg_cobi_redeem_duration)}</td>
                          <td className="py-4 px-6 border-b border-gray-200 text-gray-700">{formatDecimal(averagesData[chainPair].avg_user_refund_duration)}</td>
                          <td className="py-4 px-6 border-b border-gray-200 text-gray-700">{formatDecimal(averagesData[chainPair].avg_cobi_refund_duration)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              !error && <div className="text-gray-600 text-center mt-8 animate-pulse">Loading average durations...</div>
            )
          )}
        </div>

        {/* Bitcoin Average Durations */}
        <div className="max-w-7xl mx-auto mb-12">
          <h2 className="text-2xl font-bold mb-6 inline-block border-b-2 border-[#F06292] pb-2 text-gray-800">Bitcoin Average Durations</h2>
          {isFetching ? (
            <div className="text-gray-600 text-center mt-8 animate-pulse">Fetching Bitcoin chains...</div>
          ) : (
            averagesData ? (
              <div className="overflow-x-auto rounded-xl backdrop-blur bg-white/90 border border-gray-200/50 shadow-lg">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-800 shadow-md">
                      <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100">Chain Pair</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100">Total Orders</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100">User Init</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100">Cobi Init</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100">User Redeem</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100">Cobi Redeem</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100">User Refund</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100">Cobi Refund</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getBitcoinChainPairs(averagesData)
                      .filter((chainPair) => averagesData[chainPair].total_orders > 0)
                      .map((chainPair, idx) => (
                        <tr key={chainPair} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-all duration-300 shadow-sm`}>
                          <td className="py-4 px-6 border-b border-gray-200 font-medium text-gray-800">{chainPair}</td>
                          <td className="py-4 px-6 border-b border-gray-200 text-[#F06292] font-semibold">{averagesData[chainPair].total_orders}</td>
                          <td className="py-4 px-6 border-b border-gray-200 text-gray-700">{formatDecimal(averagesData[chainPair].avg_user_init_duration)}</td>
                          <td className="py-4 px-6 border-b border-gray-200 text-gray-700">{formatDecimal(averagesData[chainPair].avg_cobi_init_duration)}</td>
                          <td className="py-4 px-6 border-b border-gray-200 text-gray-700">{formatDecimal(averagesData[chainPair].avg_user_redeem_duration)}</td>
                          <td className="py-4 px-6 border-b border-gray-200 text-gray-700">{formatDecimal(averagesData[chainPair].avg_cobi_redeem_duration)}</td>
                          <td className="py-4 px-6 border-b border-gray-200 text-gray-700">{formatDecimal(averagesData[chainPair].avg_user_refund_duration)}</td>
                          <td className="py-4 px-6 border-b border-gray-200 text-gray-700">{formatDecimal(averagesData[chainPair].avg_cobi_refund_duration)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              !error && <div className="text-gray-600 text-center mt-8 animate-pulse">Loading Bitcoin average durations...</div>
            )
          )}
        </div>



        {/* Anomalous Orders (Non-Bitcoin) */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 inline-block border-b-2 border-[#F06292] pb-2 text-gray-800">Anomalous Orders</h2>
          {isFetching ? (
            <div className="text-gray-600 text-center mt-8 animate-pulse">Fetching anomalous orders...</div>
          ) : (
            anomalyOrdersData && getNonBitcoinChainPairs(anomalyOrdersData).map((chainPair) => (
              <div key={chainPair} className="mb-8">
                <details className="bg-white/90 backdrop-blur rounded-xl border border-gray-200/50 overflow-hidden shadow-lg">
                  <summary className="py-4 px-6 bg-gray-100 cursor-pointer font-medium text-gray-800 flex items-center justify-between">
                    <span className="text-lg">{chainPair}</span>
                    <span className="bg-gray-200 text-gray-600 py-1 px-3 rounded-full text-sm">
                      {anomalyOrdersData[chainPair].length} orders
                    </span>
                  </summary>
                  <div className="p-6">
                    {anomalyOrdersData[chainPair].length === 0 ? (
                      <p className="text-gray-500 text-sm">No anomalous orders found for this chain pair.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-50 text-gray-800 shadow-md">
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">Order ID</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">Created At</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">User Init</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">Cobi Init</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">User Redeem</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">Cobi Redeem</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">User Refund</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">Cobi Refund</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">Overall</th>
                            </tr>
                          </thead>
                          <tbody>
                            {anomalyOrdersData[chainPair].map((order: Order, idx) => (
                              <tr key={order.create_order_id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-300 shadow-sm`}>
                                <td className="py-3 px-4 border-b border-gray-200 font-mono text-xs text-gray-800 flex items-center gap-2">
                                  {order.create_order_id}
                                  <button
                                    onClick={() => copyToClipboard(order.create_order_id)}
                                    className="text-gray-500 hover:text-[#F06292] transition-colors duration-200"
                                    title={copiedOrderId === order.create_order_id ? "Copied!" : "Copy Order ID"}
                                  >
                                    {copiedOrderId === order.create_order_id ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    ) : (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                      </svg>
                                    )}
                                  </button>
                                </td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">
                                  {new Date(order.created_at).toLocaleString()}
                                </td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">{formatDecimal(order.durations.user_init_duration)}</td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">{formatDecimal(order.durations.cobi_init_duration)}</td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">{formatDecimal(order.durations.user_redeem_duration)}</td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">{formatDecimal(order.durations.cobi_redeem_duration)}</td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">{formatDecimal(order.durations.user_refund_duration)}</td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">{formatDecimal(order.durations.cobi_refund_duration)}</td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs font-medium text-[#F06292]">{formatDecimal(order.durations.overall_duration)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            ))
          )}
          {!anomalyOrdersData && !isFetching && !error && (
            <div className="text-gray-600 text-center mt-8 animate-pulse">Loading anomalous orders...</div>
          )}
        </div>

        {/* Bitcoin Anomalous Orders */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 inline-block border-b-2 border-[#F06292] pb-2 text-gray-800">Bitcoin Anomalous Orders</h2>
          {isFetching ? (
            <div className="text-gray-600 text-center mt-8 animate-pulse">Fetching Bitcoin anomalous orders...</div>
          ) : (
            anomalyOrdersData && getBitcoinChainPairs(anomalyOrdersData).map((chainPair) => (
              <div key={chainPair} className="mb-8">
                <details className="bg-white/90 backdrop-blur rounded-xl border border-gray-200/50 overflow-hidden shadow-lg">
                  <summary className="py-4 px-6 bg-gray-100 cursor-pointer font-medium text-gray-800 flex items-center justify-between">
                    <span className="text-lg">{chainPair}</span>
                    <span className="bg-gray-200 text-gray-600 py-1 px-3 rounded-full text-sm">
                      {anomalyOrdersData[chainPair].length} orders
                    </span>
                  </summary>
                  <div className="p-6">
                    {anomalyOrdersData[chainPair].length === 0 ? (
                      <p className="text-gray-500 text-sm">No anomalous orders found for this chain pair.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-50 text-gray-800 shadow-md">
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">Order ID</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">Created At</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">User Init</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">Cobi Init</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">User Redeem</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">Cobi Redeem</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">User Refund</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">Cobi Refund</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">Overall</th>
                            </tr>
                          </thead>
                          <tbody>
                            {anomalyOrdersData[chainPair].map((order: Order, idx) => (
                              <tr key={order.create_order_id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-300 shadow-sm`}>
                                <td className="py-3 px-4 border-b border-gray-200 font-mono text-xs text-gray-800 flex items-center gap-2">
                                  {order.create_order_id}
                                  <button
                                    onClick={() => copyToClipboard(order.create_order_id)}
                                    className="text-gray-500 hover:text-[#F06292] transition-colors duration-200"
                                    title={copiedOrderId === order.create_order_id ? "Copied!" : "Copy Order ID"}
                                  >
                                    {copiedOrderId === order.create_order_id ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    ) : (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                      </svg>
                                    )}
                                  </button>
                                </td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">
                                  {new Date(order.created_at).toLocaleString()}
                                </td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">{formatDecimal(order.durations.user_init_duration)}</td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">{formatDecimal(order.durations.cobi_init_duration)}</td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">{formatDecimal(order.durations.user_redeem_duration)}</td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">{formatDecimal(order.durations.cobi_redeem_duration)}</td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">{formatDecimal(order.durations.user_refund_duration)}</td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">{formatDecimal(order.durations.cobi_refund_duration)}</td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs font-medium text-[#F06292]">{formatDecimal(order.durations.overall_duration)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            ))
          )}
          {!anomalyOrdersData && !isFetching && !error && (
            <div className="text-gray-600 text-center mt-8 animate-pulse">Loading Bitcoin anomalous orders...</div>
          )}
        </div>

        {/* Anomaly Thresholds (Non-Bitcoin) */}
        <div className="max-w-7xl mx-auto mb-12">
          <h2 className="text-2xl font-bold mb-6 inline-block border-b-2 border-[#F06292] pb-2 text-gray-800">Anomaly Thresholds</h2>
          {isFetching ? (
            <div className="text-gray-600 text-center mt-8 animate-pulse">Fetching thresholds...</div>
          ) : (
            anomaliesData && getNonBitcoinChainPairs(anomaliesData).length > 0 ? (
              <div className="overflow-x-auto rounded-xl backdrop-blur bg-white/90 border border-gray-200/50 shadow-lg">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-800 shadow-md">
                      <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100">Chain Pair</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100">User Init</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100">Cobi Init</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100">User Redeem</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100">Cobi Redeem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getNonBitcoinChainPairs(anomaliesData).map((chainPair, idx) => (
                      <tr key={chainPair} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-all duration-300 shadow-sm`}>
                        <td className="py-4 px-6 border-b border-gray-200 font-medium text-gray-800">{chainPair}</td>
                        <td className="py-4 px-6 border-b border-gray-200 text-gray-700">{formatDecimal(anomaliesData[chainPair].user_init_duration.upper)}</td>
                        <td className="py-4 px-6 border-b border-gray-200 text-gray-700">{formatDecimal(anomaliesData[chainPair].cobi_init_duration.upper)}</td>
                        <td className="py-4 px-6 border-b border-gray-200 text-gray-700">{formatDecimal(anomaliesData[chainPair].user_redeem_duration.upper)}</td>
                        <td className="py-4 px-6 border-b border-gray-200 text-gray-700">{formatDecimal(anomaliesData[chainPair].cobi_redeem_duration.upper)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-gray-600 text-center mt-8 animate-pulse">
                {anomaliesData ? 'No non-Bitcoin anomaly thresholds available' : 'Loading anomaly thresholds...'}
              </div>
            )
          )}
        </div>

        {/* Bitcoin Anomaly Thresholds */}
        <div className="max-w-7xl mx-auto mb-12">
          <h2 className="text-2xl font-bold mb-6 inline-block border-b-2 border-[#F06292] pb-2 text-gray-800">Bitcoin Anomaly Thresholds </h2>
          {isFetching ? (
            <div className="text-gray-600 text-center mt-8 animate-pulse">Fetching Bitcoin thresholds...</div>
          ) : (
            anomaliesData && getBitcoinChainPairs(anomaliesData).length > 0 ? (
              <div className="overflow-x-auto rounded-xl backdrop-blur bg-white/90 border border-gray-200/50 shadow-lg">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-800 shadow-md">
                      <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100">Chain Pair</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100">User Init</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100">Cobi Init</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100">User Redeem</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100">Cobi Redeem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getBitcoinChainPairs(anomaliesData).map((chainPair, idx) => (
                      <tr key={chainPair} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-all duration-300 shadow-sm`}>
                        <td className="py-4 px-6 border-b border-gray-200 font-medium text-gray-800">{chainPair}</td>
                        <td className="py-4 px-6 border-b border-gray-200 text-gray-700">{formatDecimal(anomaliesData[chainPair].user_init_duration.upper)}</td>
                        <td className="py-4 px-6 border-b border-gray-200 text-gray-700">{formatDecimal(anomaliesData[chainPair].cobi_init_duration.upper)}</td>
                        <td className="py-4 px-6 border-b border-gray-200 text-gray-700">{formatDecimal(anomaliesData[chainPair].user_redeem_duration.upper)}</td>
                        <td className="py-4 px-6 border-b border-gray-200 text-gray-700">{formatDecimal(anomaliesData[chainPair].cobi_redeem_duration.upper)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-gray-600 text-center mt-8 animate-pulse">
                {anomaliesData ? 'No Bitcoin anomaly thresholds available' : 'Loading Bitcoin anomaly thresholds...'}
              </div>
            )
          )}
        </div>

        {/* Individual Orders (Non-Bitcoin) */}
        <div className="max-w-7xl mx-auto mb-12">
          <h2 className="text-2xl font-bold mb-6 inline-block border-b-2 border-[#F06292] pb-2 text-gray-800">Individual Orders</h2>
          {isFetching ? (
            <div className="text-gray-600 text-center mt-8 animate-pulse">Fetching chains...</div>
          ) : (
            ordersData && getNonBitcoinChainPairs(ordersData).map((chainPair) => (
              <div key={chainPair} className="mb-8">
                <details className="bg-white/90 backdrop-blur rounded-xl border border-gray-200/50 overflow-hidden shadow-lg">
                  <summary className="py-4 px-6 bg-gray-100 cursor-pointer font-medium text-gray-800 flex items-center justify-between">
                    <span className="text-lg">{chainPair}</span>
                    <span className="bg-gray-200 text-gray-600 py-1 px-3 rounded-full text-sm">
                      {ordersData[chainPair].length} orders
                    </span>
                  </summary>
                  <div className="p-6">
                    {ordersData[chainPair].length === 0 ? (
                      <p className="text-gray-500 text-sm">No orders found for this chain pair.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-50 text-gray-800 shadow-md">
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">Order ID</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">Created At</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">User Init</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">Cobi Init</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">User Redeem</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">Cobi Redeem</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">User Refund</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">Cobi Refund</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">Overall</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ordersData[chainPair].map((order: Order, idx) => (
                              <tr key={order.create_order_id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-300 shadow-sm`}>
                                <td className="py-3 px-4 border-b border-gray-200 font-mono text-xs text-gray-800 flex items-center gap-2">
                                  {order.create_order_id}
                                  <button
                                    onClick={() => copyToClipboard(order.create_order_id)}
                                    className="text-gray-500 hover:text-[#F06292] transition-colors duration-200"
                                    title={copiedOrderId === order.create_order_id ? "Copied!" : "Copy Order ID"}
                                  >
                                    {copiedOrderId === order.create_order_id ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    ) : (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                      </svg>
                                    )}
                                  </button>
                                </td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">
                                  {new Date(order.created_at).toLocaleString()}
                                </td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">{formatDecimal(order.durations.user_init_duration)}</td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">{formatDecimal(order.durations.cobi_init_duration)}</td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">{formatDecimal(order.durations.user_redeem_duration)}</td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">{formatDecimal(order.durations.cobi_redeem_duration)}</td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">{formatDecimal(order.durations.user_refund_duration)}</td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">{formatDecimal(order.durations.cobi_refund_duration)}</td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs font-medium text-[#F06292]">{formatDecimal(order.durations.overall_duration)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            ))
          )}
          {!ordersData && !isFetching && !error && (
            <div className="text-gray-600 text-center mt-8 animate-pulse">Loading individual orders...</div>
          )}
        </div>

        {/* Bitcoin Individual Orders */}
        <div className="max-w-7xl mx-auto mb-12">
          <h2 className="text-2xl font-bold mb-6 inline-block border-b-2 border-[#F06292] pb-2 text-gray-800">Bitcoin Individual Orders</h2>
          {isFetching ? (
            <div className="text-gray-600 text-center mt-8 animate-pulse">Fetching Bitcoin chains...</div>
          ) : (
            ordersData && getBitcoinChainPairs(ordersData).map((chainPair) => (
              <div key={chainPair} className="mb-8">
                <details className="bg-white/90 backdrop-blur rounded-xl border border-gray-200/50 overflow-hidden shadow-lg">
                  <summary className="py-4 px-6 bg-gray-100 cursor-pointer font-medium text-gray-800 flex items-center justify-between">
                    <span className="text-lg">{chainPair}</span>
                    <span className="bg-gray-200 text-gray-600 py-1 px-3 rounded-full text-sm">
                      {ordersData[chainPair].length} orders
                    </span>
                  </summary>
                  <div className="p-6">
                    {ordersData[chainPair].length === 0 ? (
                      <p className="text-gray-500 text-sm">No orders found for this chain pair.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-50 text-gray-800 shadow-md">
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">Order ID</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">Created At</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">User Init</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">Cobi Init</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">User Redeem</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">Cobi Redeem</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">User Refund</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">Cobi Refund</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50">Overall</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ordersData[chainPair].map((order: Order, idx) => (
                              <tr key={order.create_order_id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-300 shadow-sm`}>
                                <td className="py-3 px-4 border-b border-gray-200 font-mono text-xs text-gray-800 flex items-center gap-2">
                                  {order.create_order_id}
                                  <button
                                    onClick={() => copyToClipboard(order.create_order_id)}
                                    className="text-gray-500 hover:text-[#F06292] transition-colors duration-200"
                                    title={copiedOrderId === order.create_order_id ? "Copied!" : "Copy Order ID"}
                                  >
                                    {copiedOrderId === order.create_order_id ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    ) : (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                      </svg>
                                    )}
                                  </button>
                                </td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">
                                  {new Date(order.created_at).toLocaleString()}
                                </td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">{formatDecimal(order.durations.user_init_duration)}</td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">{formatDecimal(order.durations.cobi_init_duration)}</td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">{formatDecimal(order.durations.user_redeem_duration)}</td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">{formatDecimal(order.durations.cobi_redeem_duration)}</td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">{formatDecimal(order.durations.user_refund_duration)}</td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs text-gray-700">{formatDecimal(order.durations.cobi_refund_duration)}</td>
                                <td className="py-3 px-4 border-b border-gray-200 text-xs font-medium text-[#F06292]">{formatDecimal(order.durations.overall_duration)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            ))
          )}
          {!ordersData && !isFetching && !error && (
            <div className="text-gray-600 text-center mt-8 animate-pulse">Loading Bitcoin individual orders...</div>
          )}
        </div>

      </div>
    </div>
  );
};

export default App;