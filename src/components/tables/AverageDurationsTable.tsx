import { useState } from 'react';
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
  const [sortColumn, setSortColumn] = useState<keyof DurationData | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const chainPairs = isBitcoin
    ? getBitcoinChainPairs(averagesData)
    : getNonBitcoinChainPairs(averagesData);

// Check if value is considered "N/A"
const isNAValue = (value: any) =>
  value === 'N/A' || value === null || value === undefined || (typeof value === 'number' && isNaN(value));

// Modified getSortValue to return a valid numeric value or NaN for "N/A"
const getSortValue = (chainPair: string, column: keyof DurationData): number => {
  const value = averagesData![chainPair][column];
  if (isNAValue(value)) return NaN;

  return typeof value === 'number' ? value : parseFloat((value as unknown as string | number | undefined)?.toString() ?? 'NaN');
};

// Sort chain pairs based on the selected column, keeping "N/A" values at the bottom
const sortedChainPairs = [...chainPairs].sort((a, b) => {
  if (!sortColumn || !averagesData) return 0;

  const aValue = getSortValue(a, sortColumn);
  const bValue = getSortValue(b, sortColumn);

  const aIsNA = isNaN(aValue);
  const bIsNA = isNaN(bValue);

  if (aIsNA && bIsNA) return 0;
  if (aIsNA) return 1; // a is "N/A" => push to end
  if (bIsNA) return -1; // b is "N/A" => push to end

  return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
});


  // Toggle sort direction or set new sort column
  const handleSort = (column: keyof DurationData) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

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
                <th
                  className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('avg_user_init_duration')}
                >
                  User Init {sortColumn === 'avg_user_init_duration' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('avg_cobi_init_duration')}
                >
                  Cobi Init {sortColumn === 'avg_cobi_init_duration' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('avg_user_redeem_duration')}
                >
                  User Redeem {sortColumn === 'avg_user_redeem_duration' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('avg_cobi_redeem_duration')}
                >
                  Cobi Redeem {sortColumn === 'avg_cobi_redeem_duration' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('avg_user_refund_duration')}
                >
                  User Refund {sortColumn === 'avg_user_refund_duration' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200 sticky top-0 bg-gray-100 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('avg_cobi_refund_duration')}
                >
                  Cobi Refund {sortColumn === 'avg_cobi_refund_duration' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedChainPairs
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