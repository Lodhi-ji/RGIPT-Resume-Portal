import { useState, useEffect } from 'react';
import api from '../../services/api';

const StudentDetailModal = ({ student, onClose }) => {
  const [resumes, setResumes] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resumes');
  const [previewHtml, setPreviewHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    if (student) fetchStudentData();
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
      alert('Failed to load resume preview');
    }
  };

  const handleDownload = async (resumeId) => {
    try {
      setDownloadingId(resumeId);
      const response = await api.get(`/admin/resumes/${resumeId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${student.name}_resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download resume');
    } finally {
      setDownloadingId(null);
    }
  };

  if (!student) return null;

  const initials = (student.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <>
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col border-l border-gray-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">{student.name}</h2>
              <p className="text-xs text-gray-500">{student.rollNo} · {student.instituteEmail}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Info pills */}
        <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 border-b border-gray-200 flex-wrap">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">{student.degree}</span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">{student.branch}</span>
          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">CPI: {student.cpi}</span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('resumes')}
            className={`py-3 px-1 mr-6 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'resumes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Resumes {!loading && `(${resumes.length})`}
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-1 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Profile
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : (
            <>
              {/* Resumes Tab */}
              {activeTab === 'resumes' && (
                <div className="space-y-3">
                  {resumes.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                      <div className="text-4xl mb-2">📄</div>
                      <p className="text-sm">No resumes created yet</p>
                    </div>
                  ) : (
                    resumes.map((resume) => (
                      <div key={resume._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 text-sm truncate">{resume.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-white border border-gray-300 text-gray-600 text-xs rounded-md font-medium">
                              {resume.template === 'template1' ? 'Template 1' : 'Template 2'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(resume.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                          <button
                            onClick={() => handlePreview(resume._id)}
                            className="px-3 py-1.5 bg-white border border-gray-300 hover:border-blue-400 hover:text-blue-600 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => handleDownload(resume._id)}
                            disabled={downloadingId === resume._id}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                          >
                            {downloadingId === resume._id ? '...' : 'Download'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-5">
                  {!profile ? (
                    <div className="text-center py-16 text-gray-400">
                      <div className="text-4xl mb-2">👤</div>
                      <p className="text-sm">Profile not created yet</p>
                    </div>
                  ) : (
                    <>
                      {/* Stats row */}
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { label: 'Skills', count: profile.skills?.length || 0 },
                          { label: 'Projects', count: profile.projects?.length || 0 },
                          { label: 'Internships', count: profile.internships?.length || 0 },
                          { label: 'Achievements', count: profile.achievements?.length || 0 },
                        ].map(({ label, count }) => (
                          <div key={label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                            <p className="text-xl font-bold text-gray-900">{count}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Contact */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Contact</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Phone</span>
                          <span className="font-medium text-gray-900">{profile.phone || '—'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Alt Email</span>
                          <span className="font-medium text-gray-900 truncate ml-4">{profile.alternateEmail || '—'}</span>
                        </div>
                      </div>

                      {/* Skills */}
                      {profile.skills?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Skills</p>
                          <div className="flex flex-wrap gap-1.5">
                            {profile.skills.map((skill, i) => (
                              <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-100">{skill}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Projects */}
                      {profile.projects?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Projects</p>
                          <div className="space-y-2">
                            {profile.projects.map((p, i) => (
                              <div key={i} className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                                <p className="text-sm font-semibold text-gray-900">{p.title}</p>
                                {p.technologies && <p className="text-xs text-gray-500 mt-0.5">{p.technologies}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Internships */}
                      {profile.internships?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Internships</p>
                          <div className="space-y-2">
                            {profile.internships.map((x, i) => (
                              <div key={i} className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                                <p className="text-sm font-semibold text-gray-900">{x.company}</p>
                                <p className="text-xs text-gray-500">{x.role}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Achievements */}
                      {profile.achievements?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Achievements</p>
                          <ul className="space-y-1">
                            {profile.achievements.map((a, i) => (
                              <li key={i} className="text-sm text-gray-700 flex gap-2">
                                <span className="text-gray-400 flex-shrink-0">•</span>{a}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Preview overlay */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-60 flex items-center justify-center p-6" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl h-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Resume Preview</h3>
              <button onClick={() => setShowPreview(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-lg">✕</button>
            </div>
            <iframe srcDoc={previewHtml} title="Resume Preview" className="flex-1 w-full border-0 rounded-b-xl" />
          </div>
        </div>
      )}
    </>
  );
};

export default StudentDetailModal;
