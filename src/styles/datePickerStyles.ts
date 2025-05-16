export const datePickerStyles = `
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
`;