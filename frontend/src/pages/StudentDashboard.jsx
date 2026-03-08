import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ChangePassword from '../components/ChangePassword';
import '../styles/StudentDashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [meRes, resumesRes] = await Promise.all([
        api.get('/students/me'),
        api.get('/resume-versions')
      ]);
      
      setData({
        student: meRes.data.student,
        profile: meRes.data.profile,
        resumes: resumesRes.data.resumeVersions
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const { student, profile, resumes } = data;
  const profileCompletion = calculateProfileCompletion(profile);

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {student.name}!</h1>
          <p className="subtitle">Manage your profile and resumes</p>
        </div>
        {student.isFirstLogin && (
          <button 
            className="change-password-btn"
            onClick={() => setShowChangePassword(true)}
          >
            Change Password
          </button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{student.cpi}</h3>
            <p>CPI</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{profile?.projects?.length || 0}</h3>
            <p>Projects</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-content">
            <h3>{profile?.internships?.length || 0}</h3>
            <p>Internships</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <h3>{resumes?.length || 0}</h3>
            <p>Resume Versions</p>
          </div>
        </div>
      </div>

      {/* Profile Completion */}
      <div className="profile-completion-card">
        <h2>Profile Completion</h2>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${profileCompletion}%` }}
          />
        </div>
        <p>{profileCompletion}% Complete</p>
        <Link to="/profile" className="complete-profile-btn">
          {profileCompletion < 100 ? 'Complete Your Profile' : 'Edit Profile'}
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/profile" className="action-card">
            <div className="action-icon">👤</div>
            <h3>Edit Profile</h3>
            <p>Update your information, add projects and skills</p>
          </Link>

          <Link to="/resumes" className="action-card">
            <div className="action-icon">📄</div>
            <h3>Manage Resumes</h3>
            <p>Create and customize multiple resume versions</p>
          </Link>

          <div 
            className="action-card clickable"
            onClick={() => setShowChangePassword(true)}
          >
            <div className="action-icon">🔒</div>
            <h3>Change Password</h3>
            <p>Update your account password</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {resumes && resumes.length > 0 && (
        <div className="recent-resumes">
          <h2>Your Resume Versions</h2>
          <div className="resume-list">
            {resumes.slice(0, 3).map((resume) => (
              <div key={resume._id} className="resume-item">
                <div className="resume-info">
                  <h4>{resume.name}</h4>
                  <p>Template: {resume.template}</p>
                  <small>
                    Updated: {new Date(resume.updatedAt).toLocaleDateString()}
                  </small>
                </div>
                <Link to="/resumes" className="view-btn">
                  View
                </Link>
              </div>
            ))}
          </div>
          {resumes.length > 3 && (
            <Link to="/resumes" className="view-all-link">
              View All Resumes →
            </Link>
          )}
        </div>
      )}

      {showChangePassword && (
        <ChangePassword onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
};

// Helper function to calculate profile completion
const calculateProfileCompletion = (profile) => {
  if (!profile) return 0;
  
  let completed = 0;
  const total = 9;
  
  if (profile.phone) completed++;
  if (profile.skills && profile.skills.length > 0) completed++;
  if (profile.projects && profile.projects.length > 0) completed++;
  if (profile.internships && profile.internships.length > 0) completed++;
  if (profile.achievements && profile.achievements.length > 0) completed++;
  if (profile.certifications && profile.certifications.length > 0) completed++;
  if (profile.positionsOfResponsibility && profile.positionsOfResponsibility.length > 0) completed++;
  if (profile.courses && profile.courses.length > 0) completed++;
  if (profile.socialLinks && Object.values(profile.socialLinks).some(v => v)) completed++;
  
  return Math.round((completed / total) * 100);
};

export default StudentDashboard;
