import { useState } from 'react';
import api from '../../services/api';
import '../../styles/ResumeCard.css';

const ResumeCard = ({ resume, onEdit, onDelete }) => {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      console.log('Generating PDF for resume:', resume._id);
      const response = await api.get(`/resume-versions/${resume._id}/generate`, {
        responseType: 'blob'
      });

      console.log('PDF response received:', response);
      console.log('Response data type:', response.data instanceof Blob);
      console.log('Response data size:', response.data.size);

      // Check if response is actually a blob
      if (!(response.data instanceof Blob)) {
        throw new Error('Invalid response format - expected Blob');
      }

      if (response.data.size === 0) {
        throw new Error('PDF file is empty');
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${resume.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('PDF download triggered successfully');
    } catch (err) {
      console.error('PDF generation error:', err);
      console.error('Error response:', err.response);
      const errorMessage = err.response?.data?.error?.message || err.message || 'Failed to generate PDF';
      alert(`Failed to generate PDF: ${errorMessage}`);
    } finally {
      setGenerating(false);
    }
  };

  const enabledSections = Object.entries(resume.sectionsEnabled)
    .filter(([, enabled]) => enabled)
    .map(([section]) => section);

  return (
    <div className="resume-card">
      <div className="resume-card-header">
        <h3>{resume.name}</h3>
        <span className="template-badge">{resume.template}</span>
      </div>

      <div className="resume-card-body">
        <div className="resume-info">
          <p className="info-label">Sections Enabled:</p>
          <p className="info-value">{enabledSections.length} sections</p>
        </div>

        <div className="resume-info">
          <p className="info-label">Projects:</p>
          <p className="info-value">{resume.selectedProjects?.length || 0} selected</p>
        </div>

        <div className="resume-info">
          <p className="info-label">Last Updated:</p>
          <p className="info-value">
            {new Date(resume.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="resume-card-actions">
        <button 
          className="action-btn generate-btn" 
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? 'Generating...' : '📥 Download PDF'}
        </button>
        <button 
          className="action-btn edit-btn" 
          onClick={() => onEdit(resume)}
        >
          ✏️ Edit
        </button>
        <button 
          className="action-btn delete-btn" 
          onClick={() => onDelete(resume._id)}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default ResumeCard;
