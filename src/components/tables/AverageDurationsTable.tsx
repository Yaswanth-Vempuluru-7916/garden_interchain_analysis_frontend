import type { DurationData } from '../../types';
import { formatDecimal, getBitcoinChainPairs, getNonBitcoinChainPairs } from '../../utils';
import LoadingSpinner from '../common/LoadingSpinner';
import SectionHeader from '../common/SectionHeader';

interface AverageDurationsTableProps {
  averagesData: Record<string, DurationData> | null;
  isFetching: boolean;
  isBitcoin: boolean;
}

const AverageDurationsTable: React.FC<AverageDurationsTableProps> = ({
  averagesData,
  isFetching,
  isBitcoin,
}) => {
  const chainPairs = isBitcoin
    ? getBitcoinChainPairs(averagesData)
    : getNonBitcoinChainPairs(averagesData);

  return (
    <div className="max-w-7xl mx-auto mb-12">
      <SectionHeader title={isBitcoin ? 'Bitcoin Average Durations' : 'Average Durations'} />
      {isFetching ? (
        <LoadingSpinner message={`Fetching ${isBitcoin ? 'Bitcoin ' : ''}chains...`} />
      ) : averagesData ? (
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
              {chainPairs
                .filter((chainPair) => averagesData[chainPair].total_orders > 0)
                .map((chainPair, idx) => (
                  <tr
                    key={chainPair}
                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-all duration-300 shadow-sm`}
                  >
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
        <LoadingSpinner message={`Loading ${isBitcoin ? 'Bitcoin ' : ''}average durations...`} />
      )}
    </div>
  );
};

export default AverageDurationsTable;