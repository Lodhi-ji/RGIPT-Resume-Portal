import { useState, useEffect } from 'react';
import api from '../services/api';
import ExcelUpload from '../components/admin/ExcelUpload';
import ResumeViewer from '../components/admin/ResumeViewer';
import StudentDetailModal from '../components/admin/StudentDetailModal';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, studentsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/students')
      ]);
      
      setStats(statsRes.data.stats);
      setStudents(studentsRes.data.students);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = () => {
    setShowUpload(false);
    fetchData();
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
  };

  const handleCloseStudentModal = () => {
    setSelectedStudent(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button className="upload-button" onClick={() => setShowUpload(true)}>
          Upload Students
        </button>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          👥 Students
        </button>
        <button
          className={`tab-button ${activeTab === 'resumes' ? 'active' : ''}`}
          onClick={() => setActiveTab('resumes')}
        >
          📄 Resumes
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Statistics Cards */}
          <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats?.totalStudents || 0}</h3>
            <p>Total Students</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{stats?.totalProfiles || 0}</h3>
            <p>Profiles Created</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <h3>{stats?.totalResumes || 0}</h3>
            <p>Resume Versions</p>
          </div>
        </div>
      </div>

      {/* Students by Branch */}
      {activeTab === 'overview' && stats?.studentsByBranch && stats.studentsByBranch.length > 0 && (
        <div className="branch-stats">
          <h2>Students by Branch</h2>
          <div className="branch-grid">
            {stats.studentsByBranch.map((branch) => (
              <div key={branch._id} className="branch-card">
                <h4>{branch._id}</h4>
                <p>{branch.count} students</p>
              </div>
            ))}
          </div>
        </div>
      )}

        </>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="students-section">
          <h2>All Students</h2>
          <div className="students-table-container">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Branch</th>
                  <th>Degree</th>
                  <th>CPI</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr 
                    key={student._id} 
                    onClick={() => handleStudentClick(student)}
                    className="clickable-row"
                    title="Click to view student details and resumes"
                  >
                    <td>{student.rollNo}</td>
                    <td>{student.name}</td>
                    <td>{student.instituteEmail}</td>
                    <td>{student.branch}</td>
                    <td>{student.degree}</td>
                    <td>{student.cpi}</td>
                    <td>{new Date(student.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resumes Tab */}
      {activeTab === 'resumes' && <ResumeViewer />}

      {/* Excel Upload Modal */}
      {showUpload && (
        <ExcelUpload
          onClose={() => setShowUpload(false)}
          onUploadComplete={handleUploadComplete}
        />
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={handleCloseStudentModal}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
