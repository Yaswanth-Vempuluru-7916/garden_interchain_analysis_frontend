import { useState, useEffect, type FormEvent } from 'react';
import axios from 'axios';
import DateRangeForm from './components/form/DateRangeForm';
import AverageDurationsTable from './components/tables/AverageDurationsTable';
import AnomalyThresholdsTable from './components/tables/AnomalyThresholdsTable';
import OrdersTable from './components/tables/OrdersTable';
import type { AveragesResponse, OrdersResponse } from './types';
import { datePickerStyles } from './styles/datePickerStyles';

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

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(text);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E0F5F5] to-[#A7E4E0] p-8 text-gray-800 font-sans">
      <style>{datePickerStyles}</style>
      <div id="portal">
        <DateRangeForm
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
          lastUpdated={lastUpdated}
          error={error}
          onSubmit={handleSubmit}
        />
        <AverageDurationsTable averagesData={averagesData} isFetching={isFetching} isBitcoin={false} />
        <AverageDurationsTable averagesData={averagesData} isFetching={isFetching} isBitcoin={true} />
        <OrdersTable
          ordersData={anomalyOrdersData}
          isFetching={isFetching}
          isBitcoin={false}
          isAnomalous={true}
          copiedOrderId={copiedOrderId}
          copyToClipboard={copyToClipboard}
        />
        <OrdersTable
          ordersData={anomalyOrdersData}
          isFetching={isFetching}
          isBitcoin={true}
          isAnomalous={true}
          copiedOrderId={copiedOrderId}
          copyToClipboard={copyToClipboard}
        />
        <AnomalyThresholdsTable anomaliesData={anomaliesData ?? null} isFetching={isFetching} isBitcoin={false} />
        <AnomalyThresholdsTable anomaliesData={anomaliesData ?? null} isFetching={isFetching} isBitcoin={true} />
        <OrdersTable
          ordersData={ordersData}
          isFetching={isFetching}
          isBitcoin={false}
          isAnomalous={false}
          copiedOrderId={copiedOrderId}
          copyToClipboard={copyToClipboard}
        />
        <OrdersTable
          ordersData={ordersData}
          isFetching={isFetching}
          isBitcoin={true}
          isAnomalous={false}
          copiedOrderId={copiedOrderId}
          copyToClipboard={copyToClipboard}
        />
      </div>
    </div>
  );
};

export default App;