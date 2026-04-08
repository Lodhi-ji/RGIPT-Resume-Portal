import { useState, useEffect } from 'react';
import api from '../services/api';
import ResumeCard from '../components/student/ResumeCard';
import ResumeBuilder from '../components/student/ResumeBuilder';
import ErrorBoundary from '../components/common/ErrorBoundary';
import '../styles/ResumePage.css';

const MAX_RESUMES = 3;

const ResumePage = () => {
  const [resumes, setResumes] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingResume, setEditingResume] = useState(null);
  const [limitError, setLimitError] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resumesRes, profileRes] = await Promise.all([
        api.get('/resume-versions'),
        api.get('/students/profile')
      ]);
      
      setResumes(resumesRes.data.resumeVersions);
      setProfile(profileRes.data.profile);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    if (resumes.length >= MAX_RESUMES) {
      setLimitError(true);
      return;
    }
    setLimitError(false);
    setEditingResume(null);
    setShowBuilder(true);
  };

  const handleEdit = (resume) => {
    setEditingResume(resume);
    setShowBuilder(true);
  };

  const handleDelete = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume version?')) {
      return;
    }

    try {
      await api.delete(`/resume-versions/${resumeId}`);
      setResumes(resumes.filter(r => r._id !== resumeId));
    } catch {
      alert('Failed to delete resume');
    }
  };

  const handleBuilderClose = () => {
    setShowBuilder(false);
    setEditingResume(null);
    fetchData();
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading resumes...</p>
      </div>
    );
  }

  return (
    <div className="resume-page">
      <div className="page-header">
        <div>
          <h1>My Resumes</h1>
          <p>Create and manage multiple resume versions</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <button
            className="create-btn"
            onClick={handleCreateNew}
            disabled={resumes.length >= MAX_RESUMES}
            style={resumes.length >= MAX_RESUMES ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            + Create New Resume
          </button>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>{resumes.length}/{MAX_RESUMES} resumes</span>
        </div>
      </div>

      {limitError && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px',
          padding: '12px 16px', marginBottom: '16px', color: '#b91c1c', fontSize: '14px'
        }}>
          Maximum 3 resumes allowed. Please delete an existing resume to create a new one.
        </div>
      )}

      {resumes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h2>No Resume Versions Yet</h2>
          <p>Create your first resume to get started</p>
          <button className="create-btn-large" onClick={handleCreateNew}>
            Create Your First Resume
          </button>
        </div>
      ) : (
        <div className="resumes-grid">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume._id}
              resume={resume}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showBuilder && (
        <ErrorBoundary onReset={handleBuilderClose}>
          <ResumeBuilder
            resume={editingResume}
            profile={profile}
            onClose={handleBuilderClose}
          />
        </ErrorBoundary>
      )}
    </div>
  );
};

export default ResumePage;
