import { useState } from 'react';
import api from '../services/api';

const PDFDownloadDebugger = ({ resumeId }) => {
  const [logs, setLogs] = useState([]);
  const [testing, setTesting] = useState(false);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  };

  const testDownload = async () => {
    setLogs([]);
    setTesting(true);
    
    try {
      addLog('Starting PDF download test...', 'info');
      addLog(`Resume ID: ${resumeId}`, 'info');
      
      // Check token
      const token = localStorage.getItem('token');
      if (!token) {
        addLog('❌ No authentication token found', 'error');
        return;
      }
      addLog('✅ Authentication token found', 'success');
      
      // Test API endpoint
      addLog(`Calling: /resume-versions/${resumeId}/generate`, 'info');
      
      const response = await api.get(`/resume-versions/${resumeId}/generate`, {
        responseType: 'blob',
      });
      
      addLog(`✅ Response received`, 'success');
      addLog(`Response status: ${response.status}`, 'info');
      addLog(`Response type: ${response.data.constructor.name}`, 'info');
      addLog(`Response size: ${response.data.size} bytes`, 'info');
      addLog(`Is Blob: ${response.data instanceof Blob}`, 'info');
      
      if (response.data.size === 0) {
        addLog('❌ PDF is empty (0 bytes)', 'error');
        return;
      }
      
      // Try to download
      addLog('Creating download link...', 'info');
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `test-resume-${resumeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      addLog('✅ Download triggered successfully!', 'success');
      
    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
      if (error.response) {
        addLog(`Response status: ${error.response.status}`, 'error');
        addLog(`Response data: ${JSON.stringify(error.response.data)}`, 'error');
      }
      console.error('Full error:', error);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '500px',
      background: 'white',
      border: '2px solid #3b82f6',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      zIndex: 9999,
      overflow: 'auto'
    }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#1f2937' }}>PDF Download Debugger</h3>
      
      <button
        onClick={testDownload}
        disabled={testing || !resumeId}
        style={{
          width: '100%',
          padding: '8px 16px',
          background: testing ? '#9ca3af' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: testing ? 'not-allowed' : 'pointer',
          marginBottom: '12px'
        }}
      >
        {testing ? 'Testing...' : 'Test PDF Download'}
      </button>
      
      {!resumeId && (
        <p style={{ color: '#ef4444', fontSize: '14px' }}>
          No resume ID provided
        </p>
      )}
      
      <div style={{
        background: '#f9fafb',
        padding: '12px',
        borderRadius: '4px',
        maxHeight: '300px',
        overflow: 'auto',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        {logs.length === 0 ? (
          <p style={{ margin: 0, color: '#6b7280' }}>No logs yet. Click "Test PDF Download" to start.</p>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              style={{
                marginBottom: '4px',
                color: log.type === 'error' ? '#ef4444' : log.type === 'success' ? '#10b981' : '#374151'
              }}
            >
              <span style={{ color: '#6b7280' }}>[{log.timestamp}]</span> {log.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PDFDownloadDebugger;
