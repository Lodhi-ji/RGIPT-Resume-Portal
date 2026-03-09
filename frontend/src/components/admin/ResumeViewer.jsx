import { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/ResumeViewer.css';

const ResumeViewer = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [filterStudent, setFilterStudent] = useState('');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await api.get('/admin/resumes');
      setResumes(response.data.resumes);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (resumeId) => {
    try {
      const response = await api.get(`/admin/resumes/${resumeId}/preview`);
      setPreviewHtml(response.data.html);
      setSelectedResume(resumeId);
      setShowPreview(true);
    } catch (error) {
      console.error('Error loading preview:', error);
      alert('Failed to load resume preview');
    }
  };

  const handleDownload = async (resumeId) => {
    try {
      console.log('Admin downloading PDF for resume:', resumeId);
      const response = await api.get(`/admin/resumes/${resumeId}/download`, {
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
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume_${resumeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('PDF download triggered successfully');
    } catch (error) {
      console.error('Error downloading resume:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to download resume';
      alert(`Failed to download resume: ${errorMessage}`);
    }
  };

  const filteredResumes = resumes.filter(resume => 
    !filterStudent || 
    resume.studentId?.name?.toLowerCase().includes(filterStudent.toLowerCase()) ||
    resume.studentId?.rollNo?.toLowerCase().includes(filterStudent.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading resumes...</div>;
  }

  return (
    <div className="resume-viewer">
      <div className="viewer-header">
        <h2>Student Resumes</h2>
        <input
          type="text"
          placeholder="Search by name or roll number..."
          value={filterStudent}
          onChange={(e) => setFilterStudent(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="resumes-table-container">
        <table className="resumes-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Roll No</th>
              <th>Resume Name</th>
              <th>Template</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredResumes.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  {filterStudent ? 'No resumes found matching your search' : 'No resumes created yet'}
                </td>
              </tr>
            ) : (
              filteredResumes.map((resume) => (
                <tr key={resume._id}>
                  <td>{resume.studentId?.name || 'N/A'}</td>
                  <td>{resume.studentId?.rollNo || 'N/A'}</td>
                  <td>{resume.name}</td>
                  <td className="template-badge">{resume.template}</td>
                  <td>{new Date(resume.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button
                      className="btn-preview"
                      onClick={() => handlePreview(resume._id)}
                      title="Preview Resume"
                    >
                      👁️ Preview
                    </button>
                    <button
                      className="btn-download"
                      onClick={() => handleDownload(resume._id)}
                      title="Download PDF"
                    >
                      📥 Download
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="preview-modal">
          <div className="preview-modal-content">
            <div className="preview-header">
              <h3>Resume Preview</h3>
              <button
                className="close-button"
                onClick={() => setShowPreview(false)}
              >
                ✕
              </button>
            </div>
            <div className="preview-body">
              <iframe
                srcDoc={previewHtml}
                title="Resume Preview"
                className="preview-iframe"
              />
            </div>
            <div className="preview-footer">
              <button
                className="btn-download-modal"
                onClick={() => handleDownload(selectedResume)}
              >
                📥 Download PDF
              </button>
              <button
                className="btn-close-modal"
                onClick={() => setShowPreview(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeViewer;
