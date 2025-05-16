import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  label: string;
}

const CustomDatePicker: React.FC<DatePickerProps> = ({ selected, onChange, label }) => {
  return (
    <div className="flex flex-col flex-1">
      <label className="text-sm font-medium text-gray-600 mb-2">{label}</label>
      <DatePicker
        selected={selected}
        onChange={(date: Date | null) => onChange(date || new Date())}
        dateFormat="yyyy-MM-dd"
        timeFormat="HH:mm"
        maxDate={new Date()}
        portalId="portal"
        placeholderText={`Select ${label.toLowerCase()}`}
      />
    </div>
  );
};

export default CustomDatePicker;