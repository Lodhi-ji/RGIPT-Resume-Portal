import { useState, useEffect } from 'react';
import api from '../services/api';
import ProfileForm from '../components/student/ProfileForm';
import '../styles/ProfilePage.css';

const NAVY = '#1a3a6b';

const ProfilePage = () => {
  const [student, setStudent] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

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

  const handleProfileUpdate = (updatedProfile, updatedStudent) => {
    setProfile(updatedProfile);
    if (updatedStudent) setStudent(prev => ({ ...prev, ...updatedStudent }));
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!student) return <div className="loading">Failed to load profile. Please refresh.</div>;

  const fieldLabelStyle = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '4px' };
  const fieldValueStyle = { fontSize: '14px', fontWeight: 600, color: '#111827' };

  const formatDob = (dob) => {
    if (!dob) return 'Not provided';
    const d = new Date(dob);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and academic details</p>
      </div>

      {/* Academic Info Card */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
        padding: '20px 24px', marginBottom: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>Academic Information</span>
          </div>
          <span style={{
            fontSize: '11px', fontWeight: 600, color: '#6b7280',
            background: '#f3f4f6', border: '1px solid #e5e7eb',
            borderRadius: '20px', padding: '3px 10px', letterSpacing: '0.03em'
          }}>Read-only · Set by admin</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px 24px' }}>
          {[
            { label: 'Name', value: student.name },
            { label: 'Roll Number', value: student.rollNo, accent: true },
            { label: 'Institute Email', value: student.instituteEmail },
            { label: 'Branch', value: student.branch },
            { label: 'Degree', value: student.degree },
            { label: 'CPI', value: student.cpi ? `${student.cpi}${student.cgpaRemark ? ` (${student.cgpaRemark})` : ''}` : '—', accent: true },
            { label: 'Graduation Year', value: student.graduationYear || '—' },
            { label: 'Date of Birth', value: formatDob(student.dob) },
            { label: 'Gender', value: student.gender || 'Not provided' },
          ].map(({ label, value, accent }) => (
            <div key={label}>
              <div style={fieldLabelStyle}>{label}</div>
              <div style={{ ...fieldValueStyle, color: accent ? NAVY : '#111827' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Editable Profile Form */}
      <ProfileForm profile={profile} student={student} onUpdate={handleProfileUpdate} />
    </div>
  );
};

export default ProfilePage;
