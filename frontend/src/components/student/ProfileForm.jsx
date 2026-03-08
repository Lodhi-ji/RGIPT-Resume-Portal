import { useState } from 'react';
import api from '../../services/api';
import { validateProfileForm, getErrorMessage } from '../../utils/validation';

const ProfileForm = ({ profile, onUpdate }) => {
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
  });
  
  const [newSkill, setNewSkill] = useState('');
  const [newAchievement, setNewAchievement] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Skills
  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  // Achievements
  const addAchievement = () => {
    if (newAchievement.trim()) {
      setFormData(prev => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement.trim()]
      }));
      setNewAchievement('');
    }
  };

  const removeAchievement = (index) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  // Social Links
  const addSocialLink = () => {
    setFormData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { title: '', url: '', icon: 'link', displayInHeader: false }]
    }));
  };

  const updateSocialLink = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeSocialLink = (index) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  // Projects
  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        title: '',
        description: '',
        technologies: '',
        startDate: '',
        endDate: '',
        githubLink: '',
        liveLink: '',
        bullets: ['']
      }]
    }));
  };

  const updateProject = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => 
        i === index ? { ...project, [field]: value } : project
      )
    }));
  };

  const addProjectBullet = (projectIndex) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => 
        i === projectIndex ? { ...project, bullets: [...project.bullets, ''] } : project
      )
    }));
  };

  const updateProjectBullet = (projectIndex, bulletIndex, value) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => 
        i === projectIndex ? {
          ...project,
          bullets: project.bullets.map((bullet, j) => j === bulletIndex ? value : bullet)
        } : project
      )
    }));
  };

  const removeProjectBullet = (projectIndex, bulletIndex) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => 
        i === projectIndex ? {
          ...project,
          bullets: project.bullets.filter((_, j) => j !== bulletIndex)
        } : project
      )
    }));
  };

  const removeProject = (index) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  // Publications
  const addPublication = () => {
    setFormData(prev => ({
      ...prev,
      publications: [...prev.publications, {
        title: '',
        journal: '',
        year: '',
        paperLink: '',
        description: ''
      }]
    }));
  };

  const updatePublication = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      publications: prev.publications.map((pub, i) => 
        i === index ? { ...pub, [field]: value } : pub
      )
    }));
  };

  const removePublication = (index) => {
    setFormData(prev => ({
      ...prev,
      publications: prev.publications.filter((_, i) => i !== index)
    }));
  };

  // Certifications
  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, {
        name: '',
        issuer: '',
        issueDate: '',
        certLink: ''
      }]
    }));
  };

  const updateCertification = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const removeCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateProfileForm(formData);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      setMessage(getErrorMessage(validationErrors));
      return;
    }
    
    setSaving(true);
    setMessage('');

    try {
      const response = await api.put('/students/profile', formData);
      onUpdate(response.data.profile);
      setMessage('Profile updated successfully!');
      setErrors({});
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || 'Failed to update profile';
      setMessage(errorMsg);
      
      // Handle backend validation errors
      if (error.response?.data?.error?.details) {
        const backendErrors = {};
        error.response.data.error.details.forEach(err => {
          backendErrors[err.param] = err.msg;
        });
        setErrors(backendErrors);
      }
    } finally {
      setSaving(false);
    }
  };

  const iconOptions = [
    { value: 'github', label: 'GitHub' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'leetcode', label: 'LeetCode' },
    { value: 'codeforces', label: 'Codeforces' },
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'website', label: 'Website' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'medium', label: 'Medium' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'link', label: 'Custom Link' },
  ];

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Complete Your Profile</h2>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message}
          </div>
        )}

        {/* Contact Information */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Contact Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alternate Email</label>
              <input
                type="email"
                name="alternateEmail"
                value={formData.alternateEmail}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Skills</h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill (e.g., React, Python, Machine Learning)"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <button type="button" onClick={addSkill} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, index) => (
              <span key={index} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                {skill}
                <button type="button" onClick={() => removeSkill(index)} className="text-blue-600 hover:text-blue-800 font-bold">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Projects</h3>
          <button type="button" onClick={addProject} className="mb-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
            + Add Project
          </button>
          <div className="space-y-4">
            {formData.projects.map((project, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Project {index + 1}</h4>
                  <button type="button" onClick={() => removeProject(index)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                    Remove
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Title *</label>
                    <input
                      type="text"
                      value={project.title}
                      onChange={(e) => updateProject(index, 'title', e.target.value)}
                      placeholder="E-Commerce Platform"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={project.description}
                      onChange={(e) => updateProject(index, 'description', e.target.value)}
                      placeholder="Brief description of the project"
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Technologies (comma-separated)</label>
                    <input
                      type="text"
                      value={project.technologies}
                      onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                      placeholder="React, Node.js, MongoDB, AWS"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={project.startDate ? project.startDate.split('T')[0] : ''}
                        onChange={(e) => updateProject(index, 'startDate', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="date"
                        value={project.endDate ? project.endDate.split('T')[0] : ''}
                        onChange={(e) => updateProject(index, 'endDate', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">GitHub Link</label>
                      <input
                        type="url"
                        value={project.githubLink}
                        onChange={(e) => updateProject(index, 'githubLink', e.target.value)}
                        placeholder="https://github.com/username/project"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Live/Demo Link</label>
                      <input
                        type="url"
                        value={project.liveLink}
                        onChange={(e) => updateProject(index, 'liveLink', e.target.value)}
                        placeholder="https://demo.example.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Key Points/Achievements</label>
                    <div className="space-y-2">
                      {project.bullets.map((bullet, bulletIndex) => (
                        <div key={bulletIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) => updateProjectBullet(index, bulletIndex, e.target.value)}
                            placeholder="Describe a key achievement or feature"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => removeProjectBullet(index, bulletIndex)}
                            className="px-3 py-2 text-red-600 hover:text-red-800 font-bold text-xl"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addProjectBullet(index)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                      >
                        + Add Point
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Publications */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Publications (Research Papers, Articles)</h3>
          <button type="button" onClick={addPublication} className="mb-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
            + Add Publication
          </button>
          <div className="space-y-4">
            {formData.publications.map((pub, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Publication {index + 1}</h4>
                  <button type="button" onClick={() => removePublication(index)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                    Remove
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={pub.title}
                      onChange={(e) => updatePublication(index, 'title', e.target.value)}
                      placeholder="AI-Based Resume Parser Using NLP"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Journal/Conference</label>
                      <input
                        type="text"
                        value={pub.journal}
                        onChange={(e) => updatePublication(index, 'journal', e.target.value)}
                        placeholder="IEEE Conference on AI"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                      <input
                        type="text"
                        value={pub.year}
                        onChange={(e) => updatePublication(index, 'year', e.target.value)}
                        placeholder="2024"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Paper Link (DOI or URL)</label>
                    <input
                      type="url"
                      value={pub.paperLink}
                      onChange={(e) => updatePublication(index, 'paperLink', e.target.value)}
                      placeholder="https://doi.org/10.1234/example"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                    <textarea
                      value={pub.description}
                      onChange={(e) => updatePublication(index, 'description', e.target.value)}
                      placeholder="Brief description of the research"
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Certifications</h3>
          <button type="button" onClick={addCertification} className="mb-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
            + Add Certification
          </button>
          <div className="space-y-4">
            {formData.certifications.map((cert, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Certification {index + 1}</h4>
                  <button type="button" onClick={() => removeCertification(index)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                    Remove
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Certification Name *</label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => updateCertification(index, 'name', e.target.value)}
                      placeholder="AWS Solutions Architect"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Issuer</label>
                      <input
                        type="text"
                        value={cert.issuer}
                        onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                        placeholder="Amazon Web Services"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
                      <input
                        type="date"
                        value={cert.issueDate ? cert.issueDate.split('T')[0] : ''}
                        onChange={(e) => updateCertification(index, 'issueDate', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Link</label>
                    <input
                      type="url"
                      value={cert.certLink}
                      onChange={(e) => updateCertification(index, 'certLink', e.target.value)}
                      placeholder="https://credentials.example.com/cert123"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Social Links & Profiles</h3>
          <button type="button" onClick={addSocialLink} className="mb-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
            + Add Link
          </button>
          <div className="space-y-4">
            {formData.socialLinks.map((link, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Link {index + 1}</h4>
                  <button type="button" onClick={() => removeSocialLink(index)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                    Remove
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Platform/Title *</label>
                      <input
                        type="text"
                        value={link.title}
                        onChange={(e) => updateSocialLink(index, 'title', e.target.value)}
                        placeholder="GitHub, LinkedIn, Portfolio, etc."
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                      <select
                        value={link.icon}
                        onChange={(e) => updateSocialLink(index, 'icon', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        {iconOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL *</label>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                      placeholder="https://github.com/username"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`displayInHeader-${index}`}
                      checked={link.displayInHeader}
                      onChange={(e) => updateSocialLink(index, 'displayInHeader', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`displayInHeader-${index}`} className="ml-2 text-sm text-gray-700">
                      Display in resume header
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Achievements</h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newAchievement}
              onChange={(e) => setNewAchievement(e.target.value)}
              placeholder="Add an achievement"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <button type="button" onClick={addAchievement} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
              Add
            </button>
          </div>
          <div className="space-y-2">
            {formData.achievements.map((achievement, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-800">{achievement}</span>
                <button type="button" onClick={() => removeAchievement(index)} className="text-red-600 hover:text-red-800 font-bold text-xl">×</button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
