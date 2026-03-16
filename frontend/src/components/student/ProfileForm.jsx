import { useState } from 'react';
import api from '../../services/api';
import { validateProfileForm, getErrorMessage } from '../../utils/validation';

const TABS = [
  { id: 'contact',      label: 'Contact',       icon: '👤' },
  { id: 'skills',       label: 'Skills',         icon: '🛠️' },
  { id: 'projects',     label: 'Projects',       icon: '💻' },
  { id: 'internships',  label: 'Internships',    icon: '🏢' },
  { id: 'certifications', label: 'Certifications', icon: '🏅' },
  { id: 'publications', label: 'Publications',   icon: '📄' },
  { id: 'positions',    label: 'Positions',      icon: '🎖️' },
  { id: 'courses',      label: 'Courses',        icon: '📚' },
  { id: 'achievements', label: 'Achievements',   icon: '🏆' },
  { id: 'extracurricular', label: 'Extracurricular', icon: '⚡' },
  { id: 'social',       label: 'Social Links',   icon: '🔗' },
];

const ProfileForm = ({ profile, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('contact');
  const [formData, setFormData] = useState({
    phone: profile?.phone || '',
    alternateEmail: profile?.alternateEmail || '',
    skills: profile?.skills || [],
    achievements: profile?.achievements || [],
    projects: profile?.projects || [],
    internships: profile?.internships || [],
    publications: profile?.publications || [],
    certifications: profile?.certifications || [],
    positionsOfResponsibility: profile?.positionsOfResponsibility || [],
    courses: profile?.courses || [],
    socialLinks: profile?.socialLinks || [],
    extracurricular: profile?.extracurricular || [],
  });

  const [newSkill, setNewSkill] = useState('');
  const [newAchievement, setNewAchievement] = useState('');
  const [newExtracurricular, setNewExtracurricular] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };
  const removeSkill = (i) => setFormData(prev => ({ ...prev, skills: prev.skills.filter((_, idx) => idx !== i) }));

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

  const addCourse = () => setFormData(prev => ({ ...prev, courses: [...prev.courses, { name: '', platform: '', completionDate: '', link: '' }] }));
  const updateCourse = (i, field, value) => setFormData(prev => ({ ...prev, courses: prev.courses.map((x, idx) => idx === i ? { ...x, [field]: value } : x) }));
  const removeCourse = (i) => setFormData(prev => ({ ...prev, courses: prev.courses.filter((_, idx) => idx !== i) }));

  const addPublication = () => setFormData(prev => ({ ...prev, publications: [...prev.publications, { title: '', journal: '', year: '', paperLink: '', description: '' }] }));
  const updatePublication = (i, field, value) => setFormData(prev => ({ ...prev, publications: prev.publications.map((x, idx) => idx === i ? { ...x, [field]: value } : x) }));
  const removePublication = (i) => setFormData(prev => ({ ...prev, publications: prev.publications.filter((_, idx) => idx !== i) }));

  const addCertification = () => setFormData(prev => ({ ...prev, certifications: [...prev.certifications, { name: '', issuer: '', issueDate: '', certLink: '' }] }));
  const updateCertification = (i, field, value) => setFormData(prev => ({ ...prev, certifications: prev.certifications.map((x, idx) => idx === i ? { ...x, [field]: value } : x) }));
  const removeCertification = (i) => setFormData(prev => ({ ...prev, certifications: prev.certifications.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedFormData = {
      ...formData,
      projects: formData.projects.map(p => ({ ...p, bullets: (p.bullets || []).filter(b => b.trim() !== '') })),
      internships: formData.internships.map(x => ({ ...x, bullets: (x.bullets || []).filter(b => b.trim() !== '') })),
    };
    const validationErrors = validateProfileForm(cleanedFormData);
    if (Object.keys(validationErrors).length > 0) {
      setMessage(getErrorMessage(validationErrors));
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const response = await api.put('/students/profile', cleanedFormData);
      onUpdate(response.data.profile);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.error?.message || 'Failed to update profile');
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

  const inputCls = 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';
  const cardCls = 'bg-gray-50 rounded-lg p-5 border border-gray-200 space-y-4';

  const tabCount = (tab) => {
    const map = { skills: formData.skills.length, projects: formData.projects.length, internships: formData.internships.length, certifications: formData.certifications.length, publications: formData.publications.length, positions: formData.positionsOfResponsibility.length, courses: formData.courses.length, achievements: formData.achievements.length, extracurricular: formData.extracurricular.length, social: formData.socialLinks.length };
    return map[tab] || 0;
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
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
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-52 flex-shrink-0">
          <nav className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-4">
            {TABS.map(tab => {
              const count = tabCount(tab.id);
              return (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors border-l-4 ${
                    activeTab === tab.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                  <span className="flex items-center gap-2">
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </span>
                  {count > 0 && (
                    <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${activeTab === tab.id ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
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

          {/* SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Skills</h3>
              <div className="flex gap-2">
                <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add a skill (e.g., React, Python)" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} className={inputCls} />
                <button type="button" onClick={addSkill} className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium whitespace-nowrap">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, i) => (
                  <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                    {skill}
                    <button type="button" onClick={() => removeSkill(i)} className="text-blue-600 hover:text-blue-900 font-bold leading-none">×</button>
                  </span>
                ))}
                {formData.skills.length === 0 && <p className="text-sm text-gray-400">No skills added yet.</p>}
              </div>
            </div>
          )}

          {/* PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Projects</h3>
              {formData.projects.map((project, index) => (
                <div key={index} className={cardCls}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Project {index + 1}</span>
                    <button type="button" onClick={() => removeProject(index)} className="text-sm px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">Remove</button>
                  </div>
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
                      <input type="date" value={project.endDate ? project.endDate.split('T')[0] : ''} onChange={(e) => updateProject(index, 'endDate', e.target.value)} className={inputCls} />
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
                <div key={index} className={cardCls}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Internship {index + 1}</span>
                    <button type="button" onClick={() => removeInternship(index)} className="text-sm px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">Remove</button>
                  </div>
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
                      <input type="date" value={internship.endDate ? internship.endDate.split('T')[0] : ''} onChange={(e) => updateInternship(index, 'endDate', e.target.value)} className={inputCls} />
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
                <div key={index} className={cardCls}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Certification {index + 1}</span>
                    <button type="button" onClick={() => removeCertification(index)} className="text-sm px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">Remove</button>
                  </div>
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
                <div key={index} className={cardCls}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Publication {index + 1}</span>
                    <button type="button" onClick={() => removePublication(index)} className="text-sm px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">Remove</button>
                  </div>
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
                <div key={index} className={cardCls}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Position {index + 1}</span>
                    <button type="button" onClick={() => removePOR(index)} className="text-sm px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">Remove</button>
                  </div>
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
                      <input type="date" value={por.endDate ? por.endDate.split('T')[0] : ''} onChange={(e) => updatePOR(index, 'endDate', e.target.value)} className={inputCls} />
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
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Courses</h3>
              {formData.courses.map((course, index) => (
                <div key={index} className={cardCls}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Course {index + 1}</span>
                    <button type="button" onClick={() => removeCourse(index)} className="text-sm px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">Remove</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Course Name *</label>
                      <input type="text" value={course.name} onChange={(e) => updateCourse(index, 'name', e.target.value)} placeholder="Advanced Algorithms" required className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Platform</label>
                      <input type="text" value={course.platform} onChange={(e) => updateCourse(index, 'platform', e.target.value)} placeholder="Coursera, NPTEL..." className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Completion Date</label>
                      <input type="date" value={course.completionDate ? course.completionDate.split('T')[0] : ''} onChange={(e) => updateCourse(index, 'completionDate', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Link</label>
                      <input type="url" value={course.link} onChange={(e) => updateCourse(index, 'link', e.target.value)} placeholder="https://..." className={inputCls} />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addCourse} className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">+ Add Course</button>
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
                    <span className="text-gray-800 text-sm">🏆 {a}</span>
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
                    <span className="text-gray-800 text-sm">⚡ {a}</span>
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
                <div key={index} className={cardCls}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Link {index + 1}</span>
                    <button type="button" onClick={() => removeSocialLink(index)} className="text-sm px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">Remove</button>
                  </div>
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
