interface LoadingSpinnerProps {
  message: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="text-gray-600 text-center mt-8 animate-pulse">{message}</div>
  );
};

export default LoadingSpinner;