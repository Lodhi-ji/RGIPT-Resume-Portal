import { useState } from 'react';
import api from '../../services/api';
import { validateProfileForm } from '../../utils/validation';

const NAVY = '#1a3a6b';

const TAB_GROUPS = [
  { label: 'Basic', tabs: ['contact', 'school-education', 'objective'] },
  { label: 'Experience', tabs: ['skills', 'projects', 'internships', 'certifications'] },
  { label: 'Academic', tabs: ['publications', 'positions', 'courses'] },
  { label: 'More', tabs: ['achievements', 'extracurricular', 'social'] },
];

const TABS = [
  { id: 'contact',        label: 'Contact' },
  { id: 'school-education', label: 'School Education' },
  { id: 'objective',      label: 'Objective' },
  { id: 'skills',         label: 'Skills' },
  { id: 'projects',       label: 'Projects' },
  { id: 'internships',    label: 'Internships' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'publications',   label: 'Publications' },
  { id: 'positions',      label: 'Positions' },
  { id: 'courses',        label: 'Courses' },
  { id: 'achievements',   label: 'Achievements' },
  { id: 'extracurricular', label: 'Extracurricular' },
  { id: 'social',         label: 'Social Links' },
];

const ProfileForm = ({ profile, student, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('contact');
  const [formData, setFormData] = useState({
    phone: profile?.phone || '',
    alternateEmail: profile?.alternateEmail || '',
    skills: (profile?.skills || []).map(s => typeof s === 'string' ? null : s).filter(Boolean),
    achievements: profile?.achievements || [],
    projects: profile?.projects || [],
    internships: profile?.internships || [],
    publications: profile?.publications || [],
    certifications: profile?.certifications || [],
    positionsOfResponsibility: profile?.positionsOfResponsibility || [],
    courses: (profile?.courses || []).map(c => typeof c === 'string' ? c : (c?.name || '')).filter(Boolean),
    socialLinks: profile?.socialLinks || [],
    extracurricular: profile?.extracurricular || [],
    objective: profile?.objective || '',
  });

  const [schoolData, setSchoolData] = useState({
    class10: { school: student?.class10?.school || '', percentage: student?.class10?.percentage ?? '', year: student?.class10?.year || '', board: student?.class10?.board || '' },
    class12: { school: student?.class12?.school || '', percentage: student?.class12?.percentage ?? '', year: student?.class12?.year || '', board: student?.class12?.board || '' },
  });

  const handleSchoolChange = (level, field, value) => {
    setSchoolData(prev => ({ ...prev, [level]: { ...prev[level], [field]: value } }));
  };

  const [newAchievement, setNewAchievement] = useState('');
  const [newExtracurricular, setNewExtracurricular] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Generic helper: get flat error list for any section key
  const getSectionErrors = (prefix, index) => {
    const errs = validationErrors[`${prefix}_${index}`];
    if (!errs) return [];
    return Object.values(errs);
  };

  const getProjectErrors = (index) => getSectionErrors('project', index);
  const getInternshipErrors = (index) => getSectionErrors('internship', index);
  const getCertificationErrors = (index) => getSectionErrors('certification', index);
  const getPublicationErrors = (index) => getSectionErrors('publication', index);
  const getPORErrors = (index) => getSectionErrors('por', index);
  const getCourseErrors = (index) => getSectionErrors('course', index);
  const getSocialLinkErrors = (index) => getSectionErrors('socialLink', index);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const [newSkill, setNewSkill] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categorySkillInputs, setCategorySkillInputs] = useState({});

  const addSkillCategory = () => {
    if (newCategoryName.trim()) {
      setFormData(prev => ({ ...prev, skills: [...(prev.skills || []), { category: newCategoryName.trim(), items: [] }] }));
      setNewCategoryName('');
    }
  };
  const removeSkillCategory = (ci) => setFormData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== ci) }));
  const addSkillToCategory = (ci) => {
    const val = categorySkillInputs[ci] || '';
    if (!val.trim()) return;
    setFormData(prev => ({ ...prev, skills: prev.skills.map((cat, i) => i === ci ? { ...cat, items: [...(cat.items || []), val.trim()] } : cat) }));
    setCategorySkillInputs(prev => ({ ...prev, [ci]: '' }));
  };
  const removeSkillFromCategory = (ci, si) => setFormData(prev => ({ ...prev, skills: prev.skills.map((cat, i) => i === ci ? { ...cat, items: cat.items.filter((_, j) => j !== si) } : cat) }));

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setFormData(prev => ({ ...prev, achievements: [...prev.achievements, newAchievement.trim()] }));
      setNewAchievement('');
    }
  };
  const removeAchievement = (i) => setFormData(prev => ({ ...prev, achievements: prev.achievements.filter((_, idx) => idx !== i) }));

  const addExtracurricular = () => {
    if (newExtracurricular.trim()) {
      setFormData(prev => ({ ...prev, extracurricular: [...prev.extracurricular, newExtracurricular.trim()] }));
      setNewExtracurricular('');
    }
  };
  const removeExtracurricular = (i) => setFormData(prev => ({ ...prev, extracurricular: prev.extracurricular.filter((_, idx) => idx !== i) }));

  const addSocialLink = () => setFormData(prev => ({ ...prev, socialLinks: [...prev.socialLinks, { title: '', url: '', icon: 'link', displayInHeader: false }] }));
  const updateSocialLink = (i, field, value) => setFormData(prev => ({ ...prev, socialLinks: prev.socialLinks.map((l, idx) => idx === i ? { ...l, [field]: value } : l) }));
  const removeSocialLink = (i) => setFormData(prev => ({ ...prev, socialLinks: prev.socialLinks.filter((_, idx) => idx !== i) }));

  const addProject = () => setFormData(prev => ({ ...prev, projects: [...prev.projects, { title: '', description: '', technologies: '', startDate: '', endDate: '', githubLink: '', liveLink: '', supervisor: '', bullets: [''] }] }));
  const updateProject = (i, field, value) => setFormData(prev => ({ ...prev, projects: prev.projects.map((p, idx) => idx === i ? { ...p, [field]: value } : p) }));
  const removeProject = (i) => setFormData(prev => ({ ...prev, projects: prev.projects.filter((_, idx) => idx !== i) }));
  const addProjectBullet = (pi) => setFormData(prev => ({ ...prev, projects: prev.projects.map((p, i) => i === pi ? { ...p, bullets: [...p.bullets, ''] } : p) }));
  const updateProjectBullet = (pi, bi, value) => setFormData(prev => ({ ...prev, projects: prev.projects.map((p, i) => i === pi ? { ...p, bullets: p.bullets.map((b, j) => j === bi ? value : b) } : p) }));
  const removeProjectBullet = (pi, bi) => setFormData(prev => ({ ...prev, projects: prev.projects.map((p, i) => i === pi ? { ...p, bullets: p.bullets.filter((_, j) => j !== bi) } : p) }));

  const addInternship = () => setFormData(prev => ({ ...prev, internships: [...prev.internships, { role: '', company: '', location: '', startDate: '', endDate: '', certLink: '', bullets: [''], description: '' }] }));
  const updateInternship = (i, field, value) => setFormData(prev => ({ ...prev, internships: prev.internships.map((x, idx) => idx === i ? { ...x, [field]: value } : x) }));
  const removeInternship = (i) => setFormData(prev => ({ ...prev, internships: prev.internships.filter((_, idx) => idx !== i) }));
  const addInternshipBullet = (ii) => setFormData(prev => ({ ...prev, internships: prev.internships.map((x, i) => i === ii ? { ...x, bullets: [...(x.bullets || []), ''] } : x) }));
  const updateInternshipBullet = (ii, bi, value) => setFormData(prev => ({ ...prev, internships: prev.internships.map((x, i) => i === ii ? { ...x, bullets: x.bullets.map((b, j) => j === bi ? value : b) } : x) }));
  const removeInternshipBullet = (ii, bi) => setFormData(prev => ({ ...prev, internships: prev.internships.map((x, i) => i === ii ? { ...x, bullets: x.bullets.filter((_, j) => j !== bi) } : x) }));

  const addPOR = () => setFormData(prev => ({ ...prev, positionsOfResponsibility: [...prev.positionsOfResponsibility, { title: '', organization: '', startDate: '', endDate: '', description: '' }] }));
  const updatePOR = (i, field, value) => setFormData(prev => ({ ...prev, positionsOfResponsibility: prev.positionsOfResponsibility.map((x, idx) => idx === i ? { ...x, [field]: value } : x) }));
  const removePOR = (i) => setFormData(prev => ({ ...prev, positionsOfResponsibility: prev.positionsOfResponsibility.filter((_, idx) => idx !== i) }));

  const [newCourse, setNewCourse] = useState('');
  const addCourse = () => {
    if (newCourse.trim()) {
      setFormData(prev => ({ ...prev, courses: [...prev.courses, newCourse.trim()] }));
      setNewCourse('');
    }
  };
  const removeCourse = (i) => setFormData(prev => ({ ...prev, courses: prev.courses.filter((_, idx) => idx !== i) }));

  const addPublication = () => setFormData(prev => ({ ...prev, publications: [...prev.publications, { title: '', journal: '', year: '', paperLink: '', description: '', bullets: [''] }] }));
  const updatePublication = (i, field, value) => setFormData(prev => ({ ...prev, publications: prev.publications.map((x, idx) => idx === i ? { ...x, [field]: value } : x) }));
  const removePublication = (i) => setFormData(prev => ({ ...prev, publications: prev.publications.filter((_, idx) => idx !== i) }));
  const addPublicationBullet = (pi) => setFormData(prev => ({ ...prev, publications: prev.publications.map((p, i) => i === pi ? { ...p, bullets: [...(p.bullets || []), ''] } : p) }));
  const updatePublicationBullet = (pi, bi, value) => setFormData(prev => ({ ...prev, publications: prev.publications.map((p, i) => i === pi ? { ...p, bullets: p.bullets.map((b, j) => j === bi ? value : b) } : p) }));
  const removePublicationBullet = (pi, bi) => setFormData(prev => ({ ...prev, publications: prev.publications.map((p, i) => i === pi ? { ...p, bullets: p.bullets.filter((_, j) => j !== bi) } : p) }));

  const addCertification = () => setFormData(prev => ({ ...prev, certifications: [...prev.certifications, { name: '', issuer: '', issueDate: '', certLink: '', description: '' }] }));
  const updateCertification = (i, field, value) => setFormData(prev => ({ ...prev, certifications: prev.certifications.map((x, idx) => idx === i ? { ...x, [field]: value } : x) }));
  const removeCertification = (i) => setFormData(prev => ({ ...prev, certifications: prev.certifications.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedFormData = {
      ...formData,
      projects: formData.projects.map(p => ({ ...p, bullets: (p.bullets || []).filter(b => b.trim() !== '') })),
      internships: formData.internships.map(x => ({ ...x, bullets: (x.bullets || []).filter(b => b.trim() !== '') })),
      publications: formData.publications.map(p => ({ ...p, bullets: (p.bullets || []).filter(b => b.trim() !== '') })),
    };
    const errors = validateProfileForm(cleanedFormData, schoolData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      // Find which tab has errors and switch to it
      const errorKey = Object.keys(errors)[0];
      if (errorKey.startsWith('project_')) setActiveTab('projects');
      else if (errorKey.startsWith('internship_')) setActiveTab('internships');
      else if (errorKey.startsWith('certification_')) setActiveTab('certifications');
      else if (errorKey.startsWith('publication_')) setActiveTab('publications');
      else if (errorKey.startsWith('por_')) setActiveTab('positions');
      else if (errorKey.startsWith('course_')) setActiveTab('courses');
      else if (errorKey.startsWith('socialLink_')) setActiveTab('social');
      else if (errorKey.startsWith('achievement_')) setActiveTab('achievements');
      else if (errorKey === 'phone' || errorKey === 'alternateEmail') setActiveTab('contact');
      else if (errorKey.startsWith('class10') || errorKey.startsWith('class12')) setActiveTab('school-education');
      setMessage('Please fix the errors highlighted below.');
      return;
    }
    setValidationErrors({});
    setSaving(true);
    setMessage('');
    try {
      const response = await api.put('/students/profile', { ...cleanedFormData, class10: schoolData.class10, class12: schoolData.class12 });
      if (response.data.student) {
        const s = response.data.student;
        setSchoolData({
          class10: { school: s.class10?.school || '', percentage: s.class10?.percentage ?? '', year: s.class10?.year || '', board: s.class10?.board || '' },
          class12: { school: s.class12?.school || '', percentage: s.class12?.percentage ?? '', year: s.class12?.year || '', board: s.class12?.board || '' },
        });
      }
      onUpdate(response.data.profile, response.data.student);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errData = error.response?.data;
      // Try to extract a meaningful message from backend
      const details = errData?.error?.details;
      if (details && details.length > 0) {
        // Show the first specific validation detail from backend
        setMessage(details[0].msg || details[0].message || 'Validation failed');
      } else {
        const msg = errData?.error?.message || errData?.message || errData?.error || 'Failed to update profile';
        setMessage(typeof msg === 'string' ? msg : 'Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const iconOptions = [
    { value: 'github', label: 'GitHub' }, { value: 'linkedin', label: 'LinkedIn' },
    { value: 'leetcode', label: 'LeetCode' }, { value: 'codeforces', label: 'Codeforces' },
    { value: 'portfolio', label: 'Portfolio' }, { value: 'website', label: 'Website' },
    { value: 'twitter', label: 'Twitter' }, { value: 'medium', label: 'Medium' },
    { value: 'youtube', label: 'YouTube' }, { value: 'instagram', label: 'Instagram' },
    { value: 'link', label: 'Custom Link' },
  ];

  const formatDob = (dob) => {
    if (!dob) return 'Not provided';
    const d = new Date(dob);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none transition-colors text-sm';
  const labelCls = 'block mb-1' ;
  const cardCls = 'bg-gray-50 rounded-lg p-5 border border-gray-200 space-y-4';

  const Label = ({ children, required }) => (
    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '4px' }}>
      {children}{required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
    </label>
  );

  const InlineErrors = ({ errors }) => errors.length === 0 ? null : (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
      <p className="text-xs font-semibold text-red-700 mb-1">Fix the following:</p>
      <ul className="list-disc list-inside space-y-0.5">
        {errors.map((err, i) => <li key={i} className="text-xs text-red-600">{err}</li>)}
      </ul>
    </div>
  );

  const tabCount = (tab) => {
    if (tab === 'skills') return (formData.skills || []).reduce((sum, cat) => sum + (cat.items?.length || 0), 0);
    const map = { projects: formData.projects.length, internships: formData.internships.length, certifications: formData.certifications.length, publications: formData.publications.length, positions: formData.positionsOfResponsibility.length, courses: formData.courses.length, achievements: formData.achievements.length, extracurricular: formData.extracurricular.length, social: formData.socialLinks.length };
    return map[tab] || 0;
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
        <div className="flex items-center gap-3">
          {message && (
            <span className={`text-sm font-medium ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </span>
          )}
          <button type="submit" disabled={saving}
            style={{ background: NAVY, color: '#fff', padding: '8px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside style={{ width: '260px', flexShrink: 0 }}>
          <nav className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-4">
            {TAB_GROUPS.map(group => (
              <div key={group.label}>
                <div style={{
                  fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: '#9ca3af',
                  padding: '10px 16px 4px', borderTop: group.label !== 'Basic' ? '1px solid #f3f4f6' : 'none'
                }}>
                  {group.label}
                </div>
                {group.tabs.map(tabId => {
                  const tab = TABS.find(t => t.id === tabId);
                  if (!tab) return null;
                  const count = tabCount(tab.id);
                  const active = activeTab === tab.id;
                  return (
                    <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '9px 16px', fontSize: '13px', fontWeight: active ? 600 : 500,
                        borderLeft: active ? `3px solid ${NAVY}` : '3px solid transparent',
                        background: active ? '#eef2ff' : 'transparent',
                        color: active ? NAVY : '#4b5563',
                        cursor: 'pointer', border: 'none', textAlign: 'left', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f9fafb'; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span>{tab.label}</span>
                      {count > 0 && (
                        <span style={{
                          fontSize: '10px', fontWeight: 700, borderRadius: '10px',
                          padding: '1px 6px', background: active ? NAVY : '#e5e7eb',
                          color: active ? '#fff' : '#6b7280'
                        }}>{count}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-6 min-h-96">

          {/* CONTACT */}
          {activeTab === 'contact' && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter your phone number" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Alternate Email</label>
                  <input type="email" name="alternateEmail" value={formData.alternateEmail} onChange={handleChange} placeholder="your.email@example.com" className={inputCls} />
                </div>
              </div>
            </div>
          )}

          {/* SCHOOL EDUCATION */}
          {activeTab === 'school-education' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">School Education</h3>
                <p className="text-sm text-gray-500 mt-1">Enter your 10th and 12th standard details. This section is mandatory and cannot be skipped.</p>
              </div>

              {/* 10th Standard */}
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div style={{ background: NAVY, color: '#fff', padding: '8px 16px', fontSize: '13px', fontWeight: 600, borderLeft: `4px solid #0ea5e9` }}>
                  10th Standard (Secondary)
                </div>
                <div className="p-5 bg-gray-50 space-y-3">
                  <div>
                    <Label required>School Name</Label>
                    <input type="text" value={schoolData.class10.school} onChange={e => handleSchoolChange('class10', 'school', e.target.value)} placeholder="Enter full school name" className={inputCls} />
                    {validationErrors['class10.school'] && <p className="text-xs text-red-600 mt-1">{validationErrors['class10.school']}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label required>Percentage / CGPA</Label>
                      <input type="number" min="0" max="100" step="0.01" value={schoolData.class10.percentage} onChange={e => handleSchoolChange('class10', 'percentage', e.target.value)} placeholder="e.g. 85.5" className={inputCls} />
                      {validationErrors['class10.percentage'] && <p className="text-xs text-red-600 mt-1">{validationErrors['class10.percentage']}</p>}
                    </div>
                    <div>
                      <Label required>Passing Year</Label>
                      <input type="number" min="1980" max={new Date().getFullYear()} value={schoolData.class10.year} onChange={e => handleSchoolChange('class10', 'year', e.target.value)} placeholder="e.g. 2018" className={inputCls} />
                      {validationErrors['class10.year'] && <p className="text-xs text-red-600 mt-1">{validationErrors['class10.year']}</p>}
                    </div>
                    <div>
                      <Label>Board</Label>
                      <input type="text" value={schoolData.class10.board} onChange={e => handleSchoolChange('class10', 'board', e.target.value)} placeholder="e.g. CBSE, ICSE" className={inputCls} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 12th Standard */}
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div style={{ background: NAVY, color: '#fff', padding: '8px 16px', fontSize: '13px', fontWeight: 600, borderLeft: `4px solid #0ea5e9` }}>
                  12th Standard (Higher Secondary)
                </div>
                <div className="p-5 bg-gray-50 space-y-3">
                  <div>
                    <Label required>School Name</Label>
                    <input type="text" value={schoolData.class12.school} onChange={e => handleSchoolChange('class12', 'school', e.target.value)} placeholder="Enter full school name" className={inputCls} />
                    {validationErrors['class12.school'] && <p className="text-xs text-red-600 mt-1">{validationErrors['class12.school']}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label required>Percentage / CGPA</Label>
                      <input type="number" min="0" max="100" step="0.01" value={schoolData.class12.percentage} onChange={e => handleSchoolChange('class12', 'percentage', e.target.value)} placeholder="e.g. 85.5" className={inputCls} />
                      {validationErrors['class12.percentage'] && <p className="text-xs text-red-600 mt-1">{validationErrors['class12.percentage']}</p>}
                    </div>
                    <div>
                      <Label required>Passing Year</Label>
                      <input type="number" min="1980" max={new Date().getFullYear()} value={schoolData.class12.year} onChange={e => handleSchoolChange('class12', 'year', e.target.value)} placeholder="e.g. 2020" className={inputCls} />
                      {validationErrors['class12.year'] && <p className="text-xs text-red-600 mt-1">{validationErrors['class12.year']}</p>}
                    </div>
                    <div>
                      <Label>Board</Label>
                      <input type="text" value={schoolData.class12.board} onChange={e => handleSchoolChange('class12', 'board', e.target.value)} placeholder="e.g. CBSE, ICSE" className={inputCls} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mandatory notice */}
              <div style={{ background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: '#ef4444', fontSize: '14px', marginTop: '1px' }}>⊘</span>
                <p style={{ fontSize: '13px', color: '#b91c1c', margin: 0 }}>
                  All 6 fields are mandatory. Profile cannot be saved without completing this section.
                </p>
              </div>
            </div>
          )}

          {/* OBJECTIVE */}
          {activeTab === 'objective' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Career Objective</h3>
              <textarea
                name="objective"
                value={formData.objective}
                onChange={handleChange}
                placeholder="Write a brief career objective..."
                rows={6}
                className={inputCls}
              />
              <p className="text-xs text-gray-400">This will appear before the Education section in your resume when enabled.</p>
            </div>
          )}

          {/* SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Technical Skills</h3>
                <p className="text-sm text-gray-500 mt-1">Add skill categories (e.g. Programming Languages, Frameworks, Tools) and list skills within each.</p>
              </div>

              {(formData.skills || []).map((cat, ci) => (
                <div key={ci} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                    <span className="font-semibold text-gray-800 text-sm">{cat.category}</span>
                    <button type="button" onClick={() => removeSkillCategory(ci)}
                      className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200">Remove</button>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {(cat.items || []).map((skill, si) => (
                        <span key={si} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
                          {skill}
                          <button type="button" onClick={() => removeSkillFromCategory(ci, si)} className="text-blue-500 hover:text-blue-800 font-bold leading-none">×</button>
                        </span>
                      ))}
                      {(cat.items || []).length === 0 && <p className="text-xs text-gray-400">No skills added yet.</p>}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={categorySkillInputs[ci] || ''} onChange={e => setCategorySkillInputs(prev => ({ ...prev, [ci]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkillToCategory(ci))}
                        placeholder="Add a skill and press Enter" className={inputCls} />
                      <button type="button" onClick={() => addSkillToCategory(ci)}
                        style={{ background: NAVY, color: '#fff', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex gap-2">
                <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkillCategory())}
                  placeholder="New category name (e.g. Programming Languages)" className={inputCls} />
                <button type="button" onClick={addSkillCategory}
                  style={{ background: NAVY, color: '#fff', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  + Add Category
                </button>
              </div>
            </div>
          )}

          {/* PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Projects</h3>
              {formData.projects.map((project, index) => (
                <div key={index} className={`${cardCls} ${getProjectErrors(index).length > 0 ? 'border-red-300' : ''}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Project {index + 1}</span>
                    <button type="button" onClick={() => removeProject(index)} className="text-sm px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">Remove</button>
                  </div>
                  {getProjectErrors(index).length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-red-700 mb-1">Fix the following:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {getProjectErrors(index).map((err, i) => (
                          <li key={i} className="text-xs text-red-600">{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className={labelCls}>Title *</label>
                      <input type="text" value={project.title} onChange={(e) => updateProject(index, 'title', e.target.value)} placeholder="Project title" required className={inputCls} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelCls}>Technologies</label>
                      <input type="text" value={project.technologies} onChange={(e) => updateProject(index, 'technologies', e.target.value)} placeholder="React, Node.js, MongoDB" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Start Date</label>
                      <input type="date" value={project.startDate ? project.startDate.split('T')[0] : ''} onChange={(e) => updateProject(index, 'startDate', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>End Date</label>
                      <div className="space-y-1.5">
                        <input type="date" value={project.endDate && project.endDate !== 'ongoing' ? project.endDate.split('T')[0] : ''} onChange={(e) => updateProject(index, 'endDate', e.target.value)} disabled={project.endDate === 'ongoing'} className={`${inputCls} disabled:bg-gray-100 disabled:text-gray-400`} />
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={project.endDate === 'ongoing'} onChange={(e) => updateProject(index, 'endDate', e.target.checked ? 'ongoing' : '')} className="w-4 h-4 text-blue-600 rounded" />
                          <span className="text-sm text-gray-600">Ongoing</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>GitHub Link</label>
                      <input type="url" value={project.githubLink} onChange={(e) => updateProject(index, 'githubLink', e.target.value)} placeholder="https://github.com/..." className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Live/Demo Link</label>
                      <input type="url" value={project.liveLink} onChange={(e) => updateProject(index, 'liveLink', e.target.value)} placeholder="https://demo.example.com" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Supervisor</label>
                      <input type="text" value={project.supervisor || ''} onChange={(e) => updateProject(index, 'supervisor', e.target.value)} placeholder="Prof. A. Sharma" className={inputCls} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelCls}>Description</label>
                      <textarea value={project.description} onChange={(e) => updateProject(index, 'description', e.target.value)} placeholder="Brief description" rows="2" className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Key Points</label>
                    <div className="space-y-2">
                      {project.bullets.map((bullet, bi) => (
                        <div key={bi} className="flex gap-2">
                          <input type="text" value={bullet} onChange={(e) => updateProjectBullet(index, bi, e.target.value)} placeholder="Key achievement or feature" className={inputCls} />
                          <button type="button" onClick={() => removeProjectBullet(index, bi)} className="text-red-500 hover:text-red-700 font-bold text-xl px-1">×</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addProjectBullet(index)} className="text-sm px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">+ Add Point</button>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addProject} className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">+ Add Project</button>
            </div>
          )}

          {/* INTERNSHIPS */}
          {activeTab === 'internships' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Internships</h3>
              {formData.internships.map((internship, index) => (
                <div key={index} className={`${cardCls} ${getInternshipErrors(index).length > 0 ? 'border-red-300' : ''}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Internship {index + 1}</span>
                    <button type="button" onClick={() => removeInternship(index)} className="text-sm px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">Remove</button>
                  </div>
                  <InlineErrors errors={getInternshipErrors(index)} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Role *</label>
                      <input type="text" value={internship.role} onChange={(e) => updateInternship(index, 'role', e.target.value)} placeholder="Software Engineering Intern" required className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Company *</label>
                      <input type="text" value={internship.company} onChange={(e) => updateInternship(index, 'company', e.target.value)} placeholder="Google, Amazon..." required className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Location</label>
                      <input type="text" value={internship.location} onChange={(e) => updateInternship(index, 'location', e.target.value)} placeholder="Bangalore, Remote" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Certificate Link</label>
                      <input type="url" value={internship.certLink || ''} onChange={(e) => updateInternship(index, 'certLink', e.target.value)} placeholder="https://..." className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Start Date</label>
                      <input type="date" value={internship.startDate ? internship.startDate.split('T')[0] : ''} onChange={(e) => updateInternship(index, 'startDate', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>End Date</label>
                      <div className="space-y-1.5">
                        <input type="date" value={internship.endDate && internship.endDate !== 'ongoing' ? internship.endDate.split('T')[0] : ''} onChange={(e) => updateInternship(index, 'endDate', e.target.value)} disabled={internship.endDate === 'ongoing'} className={`${inputCls} disabled:bg-gray-100 disabled:text-gray-400`} />
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={internship.endDate === 'ongoing'} onChange={(e) => updateInternship(index, 'endDate', e.target.checked ? 'ongoing' : '')} className="w-4 h-4 text-blue-600 rounded" />
                          <span className="text-sm text-gray-600">Ongoing</span>
                        </label>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelCls}>Description</label>
                      <textarea value={internship.description} onChange={(e) => updateInternship(index, 'description', e.target.value)} placeholder="Brief description" rows="2" className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Key Points</label>
                    <div className="space-y-2">
                      {(internship.bullets || []).map((bullet, bi) => (
                        <div key={bi} className="flex gap-2">
                          <input type="text" value={bullet} onChange={(e) => updateInternshipBullet(index, bi, e.target.value)} placeholder="Key achievement" className={inputCls} />
                          <button type="button" onClick={() => removeInternshipBullet(index, bi)} className="text-red-500 hover:text-red-700 font-bold text-xl px-1">×</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addInternshipBullet(index)} className="text-sm px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">+ Add Point</button>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addInternship} className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">+ Add Internship</button>
            </div>
          )}

          {/* CERTIFICATIONS */}
          {activeTab === 'certifications' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Certifications</h3>
              {formData.certifications.map((cert, index) => (
                <div key={index} className={`${cardCls} ${getCertificationErrors(index).length > 0 ? 'border-red-300' : ''}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Certification {index + 1}</span>
                    <button type="button" onClick={() => removeCertification(index)} className="text-sm px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">Remove</button>
                  </div>
                  <InlineErrors errors={getCertificationErrors(index)} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Name *</label>
                      <input type="text" value={cert.name} onChange={(e) => updateCertification(index, 'name', e.target.value)} placeholder="AWS Certified Developer" required className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Issuer *</label>
                      <input type="text" value={cert.issuer} onChange={(e) => updateCertification(index, 'issuer', e.target.value)} placeholder="Amazon Web Services" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Issue Date</label>
                      <input type="date" value={cert.issueDate ? cert.issueDate.split('T')[0] : ''} onChange={(e) => updateCertification(index, 'issueDate', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Certificate Link</label>
                      <input type="url" value={cert.certLink} onChange={(e) => updateCertification(index, 'certLink', e.target.value)} placeholder="https://..." className={inputCls} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelCls}>Description</label>
                      <textarea value={cert.description || ''} onChange={(e) => updateCertification(index, 'description', e.target.value)} placeholder="Brief description of what you learned or achieved..." rows="2" className={inputCls} />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addCertification} className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">+ Add Certification</button>
            </div>
          )}

          {/* PUBLICATIONS */}
          {activeTab === 'publications' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Publications</h3>
              {formData.publications.map((pub, index) => (
                <div key={index} className={`${cardCls} ${getPublicationErrors(index).length > 0 ? 'border-red-300' : ''}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Publication {index + 1}</span>
                    <button type="button" onClick={() => removePublication(index)} className="text-sm px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">Remove</button>
                  </div>
                  <InlineErrors errors={getPublicationErrors(index)} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className={labelCls}>Title *</label>
                      <input type="text" value={pub.title} onChange={(e) => updatePublication(index, 'title', e.target.value)} placeholder="Publication title" required className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Journal/Conference *</label>
                      <input type="text" value={pub.journal} onChange={(e) => updatePublication(index, 'journal', e.target.value)} placeholder="IEEE Conference..." className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Year</label>
                      <input type="text" value={pub.year} onChange={(e) => updatePublication(index, 'year', e.target.value)} placeholder="2024" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Paper Link</label>
                      <input type="url" value={pub.paperLink} onChange={(e) => updatePublication(index, 'paperLink', e.target.value)} placeholder="https://doi.org/..." className={inputCls} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelCls}>Description</label>
                      <textarea value={pub.description} onChange={(e) => updatePublication(index, 'description', e.target.value)} placeholder="Brief description" rows="2" className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Key Points</label>
                    <div className="space-y-2">
                      {(pub.bullets || []).map((bullet, bi) => (
                        <div key={bi} className="flex gap-2">
                          <input type="text" value={bullet} onChange={(e) => updatePublicationBullet(index, bi, e.target.value)} placeholder="Key point about this publication" className={inputCls} />
                          <button type="button" onClick={() => removePublicationBullet(index, bi)} className="text-red-500 hover:text-red-700 font-bold text-xl px-1">×</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addPublicationBullet(index)} className="text-sm px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">+ Add Point</button>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addPublication} className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">+ Add Publication</button>
            </div>
          )}

          {/* POSITIONS */}
          {activeTab === 'positions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Positions of Responsibility</h3>
              {formData.positionsOfResponsibility.map((por, index) => (
                <div key={index} className={`${cardCls} ${getPORErrors(index).length > 0 ? 'border-red-300' : ''}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Position {index + 1}</span>
                    <button type="button" onClick={() => removePOR(index)} className="text-sm px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">Remove</button>
                  </div>
                  <InlineErrors errors={getPORErrors(index)} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Title *</label>
                      <input type="text" value={por.title} onChange={(e) => updatePOR(index, 'title', e.target.value)} placeholder="Technical Lead" required className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Organization</label>
                      <input type="text" value={por.organization} onChange={(e) => updatePOR(index, 'organization', e.target.value)} placeholder="Google Developer Student Club" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Start Date</label>
                      <input type="date" value={por.startDate ? por.startDate.split('T')[0] : ''} onChange={(e) => updatePOR(index, 'startDate', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>End Date</label>
                      <div className="space-y-1.5">
                        <input type="date" value={por.endDate && por.endDate !== 'ongoing' ? por.endDate.split('T')[0] : ''} onChange={(e) => updatePOR(index, 'endDate', e.target.value)} disabled={por.endDate === 'ongoing'} className={`${inputCls} disabled:bg-gray-100 disabled:text-gray-400`} />
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={por.endDate === 'ongoing'} onChange={(e) => updatePOR(index, 'endDate', e.target.checked ? 'ongoing' : '')} className="w-4 h-4 text-blue-600 rounded" />
                          <span className="text-sm text-gray-600">Ongoing</span>
                        </label>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelCls}>Description</label>
                      <textarea value={por.description} onChange={(e) => updatePOR(index, 'description', e.target.value)} placeholder="Brief description" rows="2" className={inputCls} />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addPOR} className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">+ Add Position</button>
            </div>
          )}

          {/* COURSES */}
          {activeTab === 'courses' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Key Courses Taken</h3>
                <p className="text-sm text-gray-500 mt-1">Add academic courses you have studied (e.g. Data Structures, DBMS, Operating Systems).</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCourse}
                  onChange={e => setNewCourse(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCourse())}
                  placeholder="Add a course name"
                  className={inputCls}
                />
                <button type="button" onClick={addCourse}
                  style={{ background: NAVY, color: '#fff', padding: '8px 18px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.courses.map((course, i) => (
                  <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                    style={{ background: '#eef2ff', color: NAVY, border: `1px solid #c7d2fe` }}>
                    {course}
                    <button type="button" onClick={() => removeCourse(i)}
                      style={{ color: NAVY, fontWeight: 700, fontSize: '16px', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                  </span>
                ))}
                {formData.courses.length === 0 && <p className="text-sm text-gray-400">No courses added yet.</p>}
              </div>
            </div>
          )}

          {/* ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Achievements</h3>
              <div className="flex gap-2">
                <input type="text" value={newAchievement} onChange={(e) => setNewAchievement(e.target.value)} placeholder="Add an achievement" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())} className={inputCls} />
                <button type="button" onClick={addAchievement} className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium whitespace-nowrap">Add</button>
              </div>
              <div className="space-y-2">
                {formData.achievements.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-800 text-sm">{a}</span>
                    <button type="button" onClick={() => removeAchievement(i)} className="text-red-500 hover:text-red-700 font-bold text-xl leading-none">×</button>
                  </div>
                ))}
                {formData.achievements.length === 0 && <p className="text-sm text-gray-400">No achievements added yet.</p>}
              </div>
            </div>
          )}

          {/* EXTRACURRICULAR */}
          {activeTab === 'extracurricular' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Extracurricular Activities</h3>
              <div className="flex gap-2">
                <input type="text" value={newExtracurricular} onChange={(e) => setNewExtracurricular(e.target.value)} placeholder="Add an activity" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExtracurricular())} className={inputCls} />
                <button type="button" onClick={addExtracurricular} className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium whitespace-nowrap">Add</button>
              </div>
              <div className="space-y-2">
                {formData.extracurricular.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-800 text-sm">{a}</span>
                    <button type="button" onClick={() => removeExtracurricular(i)} className="text-red-500 hover:text-red-700 font-bold text-xl leading-none">×</button>
                  </div>
                ))}
                {formData.extracurricular.length === 0 && <p className="text-sm text-gray-400">No activities added yet.</p>}
              </div>
            </div>
          )}

          {/* SOCIAL LINKS */}
          {activeTab === 'social' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Social Links</h3>
              {formData.socialLinks.map((link, index) => (
                <div key={index} className={`${cardCls} ${getSocialLinkErrors(index).length > 0 ? 'border-red-300' : ''}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Link {index + 1}</span>
                    <button type="button" onClick={() => removeSocialLink(index)} className="text-sm px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">Remove</button>
                  </div>
                  <InlineErrors errors={getSocialLinkErrors(index)} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Title *</label>
                      <input type="text" value={link.title} onChange={(e) => updateSocialLink(index, 'title', e.target.value)} placeholder="GitHub" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Icon</label>
                      <select value={link.icon} onChange={(e) => updateSocialLink(index, 'icon', e.target.value)} className={inputCls}>
                        {iconOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelCls}>URL *</label>
                      <input type="url" value={link.url} onChange={(e) => updateSocialLink(index, 'url', e.target.value)} placeholder="https://github.com/username" className={inputCls} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id={`header-${index}`} checked={link.displayInHeader} onChange={(e) => updateSocialLink(index, 'displayInHeader', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                      <label htmlFor={`header-${index}`} className="text-sm text-gray-700">Show in resume header</label>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addSocialLink} className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">+ Add Link</button>
            </div>
          )}

        </div>
      </div>
    </form>
  );
};

export default ProfileForm;
