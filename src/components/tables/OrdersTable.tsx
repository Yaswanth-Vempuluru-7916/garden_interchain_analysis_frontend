import { useState, useMemo } from 'react';
import type { Order } from '../../types';
import { formatDecimal, getBitcoinChainPairs, getNonBitcoinChainPairs } from '../../utils';
import LoadingSpinner from '../common/LoadingSpinner';
import SectionHeader from '../common/SectionHeader';

interface OrdersTableProps {
  ordersData: Record<string, Order[]> | null;
  isFetching: boolean;
  isBitcoin: boolean;
  isAnomalous: boolean;
  copiedOrderId: string | null;
  copyToClipboard: (text: string) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  ordersData,
  isFetching,
  isBitcoin,
  isAnomalous,
  copiedOrderId,
  copyToClipboard,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedChainPairs, setExpandedChainPairs] = useState<Set<string>>(new Set());

  const chainPairs = isBitcoin
    ? getBitcoinChainPairs(ordersData)
    : getNonBitcoinChainPairs(ordersData);

  const toggleChainPair = (chainPair: string) => {
    setExpandedChainPairs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chainPair)) {
        newSet.delete(chainPair);
      } else {
        newSet.add(chainPair);
      }
      return newSet;
    });
  };

  const filteredOrdersData = useMemo(() => {
    if (!ordersData) return null;

    if (!searchTerm) return ordersData;

    const filtered: Record<string, Order[]> = {};
    for (const chainPair in ordersData) {
      const filteredOrders = ordersData[chainPair].filter(order =>
        order.create_order_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filteredOrders.length > 0) {
        filtered[chainPair] = filteredOrders;
      }
    }
    return filtered;
  }, [ordersData, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto mt-8 mb-8">
      <SectionHeader
        title={isBitcoin ? `Bitcoin ${isAnomalous ? 'Anomalous' : 'Individual'} Orders` : `${isAnomalous ? 'Anomalous' : 'Individual'} Orders`}
      />

      {/* Search Input */}
      <div className="mb-4 px-2">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search by Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F06292] focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {isFetching ? (
        <LoadingSpinner message={`Fetching ${isBitcoin ? 'Bitcoin ' : ''}${isAnomalous ? 'anomalous' : 'chains'}...`} />
      ) : (
        filteredOrdersData &&
        chainPairs.map((chainPair) => (
          filteredOrdersData[chainPair] && (
            <div key={chainPair} className="mb-4">
              <div
                className="bg-white/90 backdrop-blur rounded-xl border border-gray-200/50 overflow-hidden shadow-lg"
              >
                <div
                  className="py-4 px-6 bg-gray-100 cursor-pointer font-medium text-gray-800 flex items-center justify-between"
                  onClick={() => toggleChainPair(chainPair)}
                >
                  <span className="text-lg">{chainPair}</span>
                  <div className="flex items-center gap-3">
                    <span className="bg-gray-200 text-gray-600 py-1 px-3 rounded-full text-sm">
                      {filteredOrdersData[chainPair].length} orders
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedChainPairs.has(chainPair) ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {expandedChainPairs.has(chainPair) && (
                  <div className="p-2">
                    {filteredOrdersData[chainPair].length === 0 ? (
                      <p className="text-gray-500 text-sm p-4">No {isAnomalous ? 'anomalous' : ''} orders found for this chain pair.</p>
                    ) : (
                      <div className="overflow-x-auto" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-50 text-gray-800">
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50 z-10">Order ID</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50 z-10">Created At</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50 z-10">User Init</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50 z-10">Cobi Init</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50 z-10">User Redeem</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50 z-10">Cobi Redeem</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50 z-10">User Refund</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50 z-10">Cobi Refund</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-50 z-10">Overall</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredOrdersData[chainPair].map((order, idx) => (
                              <tr
                                key={order.create_order_id}
                                className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-300`}
                              >
                                <td className="py-3 px-4 border-b border-gray-200 font-mono text-xs text-gray-800 flex items-center gap-2">
                                  {order.create_order_id}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(order.create_order_id);
                                    }}
                                    className="text-gray-500 hover:text-[#F06292] transition-colors duration-200"
                                    title={copiedOrderId === order.create_order_id ? 'Copied!' : 'Copy Order ID'}
                                  >
                                    {copiedOrderId === order.create_order_id ? (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 text-green-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    ) : (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                        />
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
                )}
              </div>
            </div>
          )
        ))
      )}
      {!filteredOrdersData && !isFetching && (
        <LoadingSpinner
          message={`Loading ${isBitcoin ? 'Bitcoin ' : ''}${isAnomalous ? 'anomalous' : 'individual'} orders...`}
        />
      )}
    </div>
  );
};

export default OrdersTable;