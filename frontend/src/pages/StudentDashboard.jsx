import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ChangePassword from '../components/ChangePassword';
import FirstLoginModal from '../components/FirstLoginModal';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);
  const { isFirstLogin, updateIsFirstLogin } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Show FirstLoginModal automatically when isFirstLogin is true
    if (isFirstLogin) {
      setShowFirstLoginModal(true);
    }
  }, [isFirstLogin]);

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

  const handlePasswordChanged = () => {
    // Update isFirstLogin state to false after successful password change
    updateIsFirstLogin(false);
    setShowFirstLoginModal(false);
  };

  const handleCloseFirstLoginModal = () => {
    // Allow user to skip the modal
    setShowFirstLoginModal(false);
  };

  const handleDownload = async (resumeId, resumeName) => {
    try {
      const response = await api.get(`/resume-versions/${resumeId}/generate`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${resumeName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  const { student, profile, resumes } = data;
  const profileCompletion = calculateProfileCompletion(profile);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {student.name}!
            </h1>
            <p className="text-gray-600 mt-2">Manage your profile and resumes</p>
          </div>
          {isFirstLogin && (
            <button 
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200"
              onClick={() => setShowFirstLoginModal(true)}
            >
              Change Password
            </button>
          )}
        </div>

        {/* Quick Actions Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Status Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Status</h3>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Completion</span>
                <span className="font-semibold text-blue-600">{profileCompletion}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${profileCompletion}%` }}
                ></div>
              </div>
            </div>
            <Link
              to="/profile"
              className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md text-sm transition-colors duration-200"
            >
              Edit Profile
            </Link>
          </div>

          {/* Resume Count Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Resumes</h3>
            <p className="text-4xl font-bold text-blue-600 mb-4">{resumes?.length || 0}</p>
            <Link
              to="/resumes"
              className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md text-sm transition-colors duration-200"
            >
              View All
            </Link>
          </div>

          {/* Quick Create Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
            <p className="text-gray-600 text-sm mb-4">Create a new resume</p>
            <Link
              to="/resumes"
              className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md text-sm transition-colors duration-200"
            >
              + New Resume
            </Link>
          </div>
        </div>

        {/* Recent Resumes Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Resumes</h2>
          
          {resumes && resumes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <div
                  key={resume._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                >
                  {/* Resume Preview Thumbnail */}
                  <div className="h-48 bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
                    <svg 
                      className="w-16 h-16 text-blue-300" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                      />
                    </svg>
                  </div>
                  
                  {/* Resume Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                      {resume.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      Template: {resume.template}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      Created: {new Date(resume.createdAt || resume.updatedAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Link
                        to="/resumes"
                        className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-md text-center transition-colors duration-200"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDownload(resume._id, resume.name)}
                        className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-semibold rounded-md transition-colors duration-200"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg 
                className="w-16 h-16 text-gray-300 mx-auto mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No resumes yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first resume to get started
              </p>
              <Link
                to="/resumes"
                className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Create Resume
              </Link>
            </div>
          )}
        </div>

      {showChangePassword && (
        <ChangePassword onClose={() => setShowChangePassword(false)} />
      )}

      {showFirstLoginModal && (
        <FirstLoginModal 
          isOpen={showFirstLoginModal}
          onClose={handleCloseFirstLoginModal}
          onPasswordChanged={handlePasswordChanged}
        />
      )}
      </div>
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
