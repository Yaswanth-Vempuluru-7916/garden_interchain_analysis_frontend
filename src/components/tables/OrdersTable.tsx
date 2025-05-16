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
  const chainPairs = isBitcoin
    ? getBitcoinChainPairs(ordersData)
    : getNonBitcoinChainPairs(ordersData);

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        title={isBitcoin ? `Bitcoin ${isAnomalous ? 'Anomalous' : 'Individual'} Orders` : `${isAnomalous ? 'Anomalous' : 'Individual'} Orders`}
      />
      {isFetching ? (
        <LoadingSpinner message={`Fetching ${isBitcoin ? 'Bitcoin ' : ''}${isAnomalous ? 'anomalous' : 'chains'}...`} />
      ) : (
        ordersData &&
        chainPairs.map((chainPair) => (
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
                  <p className="text-gray-500 text-sm">No {isAnomalous ? 'anomalous' : ''} orders found for this chain pair.</p>
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
                        {ordersData[chainPair].map((order, idx) => (
                          <tr
                            key={order.create_order_id}
                            className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-300 shadow-sm`}
                          >
                            <td className="py-3 px-4 border-b border-gray-200 font-mono text-xs text-gray-800 flex items-center gap-2">
                              {order.create_order_id}
                              <button
                                onClick={() => copyToClipboard(order.create_order_id)}
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
            </details>
          </div>
        ))
      )}
      {!ordersData && !isFetching && (
        <LoadingSpinner
          message={`Loading ${isBitcoin ? 'Bitcoin ' : ''}${isAnomalous ? 'anomalous' : 'individual'} orders...`}
        />
      )}
    </div>
  );
};

export default OrdersTable;