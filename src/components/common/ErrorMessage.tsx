interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="text-red-600 bg-red-100/50 border border-red-300 p-4 rounded-lg animate-pulse">
      {message}
    </div>
  );
};

export default ErrorMessage;