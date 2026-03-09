import { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/StudentDetailModal.css';

const StudentDetailModal = ({ student, onClose }) => {
  const [resumes, setResumes] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resumes');
  const [previewHtml, setPreviewHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (student) {
      fetchStudentData();
    }
  }, [student]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [resumesRes, profileRes] = await Promise.all([
        api.get(`/admin/students/${student._id}/resumes`),
        api.get(`/admin/students/${student._id}/profile`).catch(() => ({ data: { profile: null } }))
      ]);
      
      setResumes(resumesRes.data.resumes || []);
      setProfile(profileRes.data.profile);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (resumeId) => {
    try {
      const response = await api.get(`/admin/resumes/${resumeId}/preview`);
      setPreviewHtml(response.data.html);
      setShowPreview(true);
    } catch (error) {
      console.error('Error loading preview:', error);
      alert('Failed to load resume preview');
    }
  };

  const handleDownload = async (resumeId) => {
    try {
      console.log('Downloading resume from student detail modal:', resumeId);
      const response = await api.get(`/admin/resumes/${resumeId}/download`, {
        responseType: 'blob'
      });

      console.log('PDF response received:', response);
      
      if (!(response.data instanceof Blob)) {
        throw new Error('Invalid response format');
      }

      if (response.data.size === 0) {
        throw new Error('PDF file is empty');
      }
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${student.name}_resume_${resumeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('PDF download triggered successfully');
    } catch (error) {
      console.error('Error downloading resume:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to download resume';
      alert(`Failed to download resume: ${errorMessage}`);
    }
  };

  if (!student) return null;

  return (
    <div className="student-detail-modal-overlay" onClick={onClose}>
      <div className="student-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="student-info-header">
            <div className="student-avatar">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2>{student.name}</h2>
              <p className="student-roll">{student.rollNo}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Student Basic Info */}
        <div className="student-basic-info">
          <div className="info-item">
            <span className="info-label">Email:</span>
            <span className="info-value">{student.instituteEmail}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Branch:</span>
            <span className="info-value">{student.branch}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Degree:</span>
            <span className="info-value">{student.degree}</span>
          </div>
          <div className="info-item">
            <span className="info-label">CPI:</span>
            <span className="info-value">{student.cpi}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'resumes' ? 'active' : ''}`}
            onClick={() => setActiveTab('resumes')}
          >
            📄 Resumes ({resumes.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {loading ? (
            <div className="loading-state">Loading...</div>
          ) : (
            <>
              {/* Resumes Tab */}
              {activeTab === 'resumes' && (
                <div className="resumes-list">
                  {resumes.length === 0 ? (
                    <div className="empty-state">
                      <p>📄</p>
                      <p>No resumes created yet</p>
                    </div>
                  ) : (
                    resumes.map((resume) => (
                      <div key={resume._id} className="resume-item">
                        <div className="resume-item-info">
                          <h4>{resume.name}</h4>
                          <div className="resume-meta">
                            <span className="template-tag">{resume.template}</span>
                            <span className="date-tag">
                              {new Date(resume.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="resume-item-actions">
                          <button
                            className="btn-preview-small"
                            onClick={() => handlePreview(resume._id)}
                          >
                            👁️ Preview
                          </button>
                          <button
                            className="btn-download-small"
                            onClick={() => handleDownload(resume._id)}
                          >
                            📥 Download
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="profile-details">
                  {!profile ? (
                    <div className="empty-state">
                      <p>👤</p>
                      <p>Profile not created yet</p>
                    </div>
                  ) : (
                    <div className="profile-sections">
                      {/* Contact Info */}
                      <div className="profile-section">
                        <h3>Contact Information</h3>
                        <div className="profile-grid">
                          <div className="profile-field">
                            <label>Phone:</label>
                            <span>{profile.phone || 'N/A'}</span>
                          </div>
                          <div className="profile-field">
                            <label>Alternate Email:</label>
                            <span>{profile.alternateEmail || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Skills */}
                      {profile.skills && profile.skills.length > 0 && (
                        <div className="profile-section">
                          <h3>Skills</h3>
                          <div className="skills-tags">
                            {profile.skills.map((skill, index) => (
                              <span key={index} className="skill-tag">{skill}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Projects */}
                      {profile.projects && profile.projects.length > 0 && (
                        <div className="profile-section">
                          <h3>Projects ({profile.projects.length})</h3>
                          {profile.projects.map((project, index) => (
                            <div key={index} className="profile-item">
                              <h4>{project.title}</h4>
                              <p>{project.description}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Internships */}
                      {profile.internships && profile.internships.length > 0 && (
                        <div className="profile-section">
                          <h3>Internships ({profile.internships.length})</h3>
                          {profile.internships.map((internship, index) => (
                            <div key={index} className="profile-item">
                              <h4>{internship.company}</h4>
                              <p className="profile-item-subtitle">{internship.role}</p>
                              <p>{internship.description}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Achievements */}
                      {profile.achievements && profile.achievements.length > 0 && (
                        <div className="profile-section">
                          <h3>Achievements</h3>
                          <ul className="profile-list">
                            {profile.achievements.map((achievement, index) => (
                              <li key={index}>{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="preview-overlay" onClick={() => setShowPreview(false)}>
            <div className="preview-container" onClick={(e) => e.stopPropagation()}>
              <div className="preview-header-inner">
                <h3>Resume Preview</h3>
                <button className="close-btn" onClick={() => setShowPreview(false)}>✕</button>
              </div>
              <iframe
                srcDoc={previewHtml}
                title="Resume Preview"
                className="preview-iframe-inner"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetailModal;
