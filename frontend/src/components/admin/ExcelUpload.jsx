import { useState } from 'react';
import api from '../../services/api';
import '../../styles/ExcelUpload.css';

const ExcelUpload = ({ onClose, onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select an Excel file (.xlsx or .xls)');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/admin/upload-students', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
      
      if (response.data.summary.failed === 0) {
        setTimeout(() => {
          onUploadComplete();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="upload-modal">
        <div className="modal-header">
          <h2>Upload Students Excel</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {!result ? (
            <>
              <div className="upload-instructions">
                <h3>Excel File Requirements:</h3>
                <ul>
                  <li>File format: .xlsx or .xls</li>
                  <li>Maximum file size: 5MB</li>
                  <li>
                    Required columns:
                    <ul>
                      <li>name, rollNo, instituteEmail, branch, degree</li>
                      <li>cpi, graduationYear, semester</li>
                      <li>10th percentage, 10th school</li>
                      <li>12th percentage, 12th school</li>
                    </ul>
                  </li>
                </ul>
              </div>

              <div className="file-input-container">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={uploading}
                  id="file-input"
                />
                <label htmlFor="file-input" className="file-label">
                  {file ? file.name : 'Choose Excel File'}
                </label>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={onClose}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  className="upload-btn"
                  onClick={handleUpload}
                  disabled={!file || uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </>
          ) : (
            <div className="upload-result">
              <h3>Upload Results</h3>
              
              <div className="result-summary">
                <div className="summary-item">
                  <span className="label">Total Rows:</span>
                  <span className="value">{result.summary.total}</span>
                </div>
                <div className="summary-item success">
                  <span className="label">Successful:</span>
                  <span className="value">{result.summary.successful}</span>
                </div>
                <div className="summary-item failed">
                  <span className="label">Failed:</span>
                  <span className="value">{result.summary.failed}</span>
                </div>
              </div>

              {result.successfulStudents.length > 0 && (
                <div className="success-list">
                  <h4>Successfully Created Students:</h4>
                  <div className="student-list">
                    {result.successfulStudents.map((student, index) => (
                      <div key={index} className="student-item">
                        <strong>{student.name}</strong> ({student.rollNo})
                        <br />
                        <small>Password: {student.defaultPassword}</small>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.failedRows.length > 0 && (
                <div className="failed-list">
                  <h4>Failed Rows:</h4>
                  <div className="error-list">
                    {result.failedRows.map((failed, index) => (
                      <div key={index} className="error-item">
                        <strong>Row {failed.row}:</strong> {failed.errors.join(', ')}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="close-result-btn" onClick={onUploadComplete}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExcelUpload;
