import { useState, useEffect } from 'react';
import api from '../services/api';
import ResumeCard from '../components/student/ResumeCard';
import ResumeBuilder from '../components/student/ResumeBuilder';
import ErrorBoundary from '../components/common/ErrorBoundary';
import '../styles/ResumePage.css';

const ResumePage = () => {
  const [resumes, setResumes] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingResume, setEditingResume] = useState(null);

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
    } catch (error) {
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
        <button className="create-btn" onClick={handleCreateNew}>
          + Create New Resume
        </button>
      </div>

      {resumes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
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
