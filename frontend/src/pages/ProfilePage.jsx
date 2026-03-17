import { useState, useEffect } from 'react';
import api from '../services/api';
import ProfileForm from '../components/student/ProfileForm';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const [student, setStudent] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/students/me');
      setStudent(response.data.student);
      setProfile(response.data.profile);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and academic details</p>
      </div>

      {/* Static Information (Read-only) */}
      <div className="static-info-section">
        <h2>Academic Information (Read-only)</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>Name</label>
            <p>{student.name}</p>
          </div>
          <div className="info-item">
            <label>Roll Number</label>
            <p>{student.rollNo}</p>
          </div>
          <div className="info-item">
            <label>Institute Email</label>
            <p>{student.instituteEmail}</p>
          </div>
          <div className="info-item">
            <label>Branch</label>
            <p>{student.branch}</p>
          </div>
          <div className="info-item">
            <label>Degree</label>
            <p>{student.degree}</p>
          </div>
          <div className="info-item">
            <label>CPI</label>
            <p>{student.cpi}{student.cgpaRemark ? ` (${student.cgpaRemark})` : ''}</p>
          </div>
          {student.graduationYear && (
            <div className="info-item">
              <label>Graduation Year</label>
              <p>{student.graduationYear}</p>
            </div>
          )}
          <div className="info-item">
            <label>Class 10th</label>
            <p>{student.class10.percentage}% - {student.class10.school}{student.class10.year ? ` (${student.class10.year})` : ''}</p>
          </div>
          <div className="info-item">
            <label>Class 12th</label>
            <p>{student.class12.percentage}% - {student.class12.school}{student.class12.year ? ` (${student.class12.year})` : ''}</p>
          </div>
        </div>
      </div>

      {/* Editable Profile Form */}
      <ProfileForm 
        profile={profile} 
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default ProfilePage;
