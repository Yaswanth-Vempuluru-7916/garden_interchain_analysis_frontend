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
}

const DateRangeForm: React.FC<DateRangeFormProps> = ({
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  lastUpdated,
  error,
  onSubmit,
}) => {
  return (
    <div className="max-w-7xl mx-auto mb-10 bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-gray-200/50">
      <h1 className="text-4xl font-bold mb-6 text-gray-800 drop-shadow-lg">Garden Interchain Analysis</h1>
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-6 items-end mb-6">
        <CustomDatePicker selected={startTime} onChange={setStartTime} label="Start Date" />
        <CustomDatePicker selected={endTime} onChange={setEndTime} label="End Date" />
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
        </div>
      </form>
      {error && <ErrorMessage message={error} />}
    </div>
  );
};

export default DateRangeForm;