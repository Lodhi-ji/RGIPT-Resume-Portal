import '../../styles/ErrorMessage.css';

const ErrorMessage = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="error-message-inline">
      <i className="fas fa-exclamation-circle"></i>
      <span>{error}</span>
    </div>
  );
};

export default ErrorMessage;
