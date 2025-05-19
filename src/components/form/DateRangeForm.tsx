import type { FormEvent } from 'react';
import CustomDatePicker from '../common/DatePicker';
import ErrorMessage from '../common/ErrorMessage';

interface DateRangeFormProps {
  startTime: Date | null;
  setStartTime: (date: Date | null) => void;
  endTime: Date | null;
  setEndTime: (date: Date | null) => void;
  lastUpdated: string;
  error: string;
  onSubmit: (e: FormEvent) => void;
  onSyncOrders: () => void;
  onUpdateTimestamps: () => void;
  isSyncing: boolean;
  isUpdatingTimestamps: boolean;
}

const DateRangeForm: React.FC<DateRangeFormProps> = ({
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  lastUpdated,
  error,
  onSubmit,
  onSyncOrders,
  onUpdateTimestamps,
  isSyncing,
  isUpdatingTimestamps,
}) => {
  return (
    <div className="max-w-7xl mx-auto mb-10 bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-gray-200/50">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Garden Interchain Analysis</h1>
      <form onSubmit={onSubmit} className="flex flex-wrap gap-6 mb-6">
        <div className="w-full sm:w-auto">
          <CustomDatePicker selected={startTime} onChange={setStartTime} label="Start Date" />
        </div>
        <div className="w-full sm:w-auto">
          <CustomDatePicker selected={endTime} onChange={setEndTime} label="End Date" />
        </div>
        <div className="w-full md:flex-1">
          <label className="text-sm font-medium text-gray-600 mb-2 block">Last Updated</label>
          <span className="block w-full bg-white/70 border border-gray-300 rounded-lg p-3 text-gray-600">
            {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'N/A'}
          </span>
        </div>
        <div className="w-full md:w-auto flex flex-wrap gap-3 items-end">
          <button
            type="submit"
            disabled={isSyncing || isUpdatingTimestamps}
            className={`w-full sm:w-auto bg-[#F06292] hover:bg-[#F06292]/80 text-white font-bold py-3 px-6 rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg ${
              isUpdatingTimestamps || isSyncing ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            Fetch Data
          </button>
          <button
            type="button"
            onClick={onSyncOrders}
            disabled={isSyncing}
            className={`w-full sm:w-auto bg-[#42A5F5] hover:bg-[#42A5F5]/80 text-white font-bold py-3 px-6 rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg ${
              isSyncing ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSyncing ? 'Syncing...' : 'Sync Orders'}
          </button>
          <button
            type="button"
            onClick={onUpdateTimestamps}
            disabled={isUpdatingTimestamps || isSyncing}
            className={`w-full sm:w-auto bg-[#66BB6A] hover:bg-[#66BB6A]/80 text-white font-bold py-3 px-6 rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg ${
              isUpdatingTimestamps || isSyncing ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isUpdatingTimestamps ? 'Updating...' : 'Update Timestamps'}
          </button>
        </div>
      </form>
      {error && <ErrorMessage message={error} />}
    </div>
  );
};

export default DateRangeForm;