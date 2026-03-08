import '../../styles/ErrorMessage.css';

const ErrorMessage = ({ error, field }) => {
  if (!error) return null;
  
  return (
    <div className="error-message-inline">
      <i className="fas fa-exclamation-circle"></i>
      <span>{error}</span>
    </div>
  );
};

export default ErrorMessage;
