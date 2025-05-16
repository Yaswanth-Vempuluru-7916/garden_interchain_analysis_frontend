import type { ThresholdData } from '../../types';
import { formatDecimal, getBitcoinChainPairs, getNonBitcoinChainPairs } from '../../utils';
import LoadingSpinner from '../common/LoadingSpinner';
import SectionHeader from '../common/SectionHeader';

interface AnomalyThresholdsTableProps {
  anomaliesData: Record<string, ThresholdData> | null;
  isFetching: boolean;
  isBitcoin: boolean;
}

const AnomalyThresholdsTable: React.FC<AnomalyThresholdsTableProps> = ({
  anomaliesData,
  isFetching,
  isBitcoin,
}) => {
  const chainPairs = isBitcoin
    ? getBitcoinChainPairs(anomaliesData)
    : getNonBitcoinChainPairs(anomaliesData);

  return (
    <div className="max-w-7xl mx-auto mb-12">
      <SectionHeader title={isBitcoin ? 'Bitcoin Anomaly Thresholds' : 'Anomaly Thresholds'} />
      {isFetching ? (
        <LoadingSpinner message={`Fetching ${isBitcoin ? 'Bitcoin ' : ''}thresholds...`} />
      ) : anomaliesData && chainPairs.length > 0 ? (
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
              {chainPairs.map((chainPair, idx) => (
                <tr
                  key={chainPair}
                  className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-all duration-300 shadow-sm`}
                >
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
        <LoadingSpinner
          message={
            anomaliesData
              ? `No ${isBitcoin ? 'Bitcoin ' : ''}anomaly thresholds available`
              : `Loading ${isBitcoin ? 'Bitcoin ' : ''}anomaly thresholds...`
          }
        />
      )}
    </div>
  );
};

export default AnomalyThresholdsTable;