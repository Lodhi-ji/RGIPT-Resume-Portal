import { useState } from 'react';
import api from '../../services/api';
import { validateProfileForm, getErrorMessage } from '../../utils/validation';
import ErrorMessage from '../common/ErrorMessage';
import '../../styles/ProfileForm.css';

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
    <form onSubmit={handleSubmit} className="profile-form">
      <h2>Complete Your Profile</h2>

      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Contact Information */}
      <div className="form-section">
        <h3>Contact Details</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>
          <div className="form-group">
            <label>Alternate Email</label>
            <input
              type="email"
              name="alternateEmail"
              value={formData.alternateEmail}
              onChange={handleChange}
              placeholder="your.email@example.com"
            />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="form-section">
        <h3>Skills</h3>
        <div className="array-input">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill (e.g., React, Python, Machine Learning)"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
          />
          <button type="button" onClick={addSkill} className="add-btn">
            Add
          </button>
        </div>
        <div className="tags-container">
          {formData.skills.map((skill, index) => (
            <span key={index} className="tag">
              {skill}
              <button type="button" onClick={() => removeSkill(index)}>×</button>
            </span>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="form-section">
        <h3>Projects</h3>
        <button type="button" onClick={addProject} className="add-btn">
          + Add Project
        </button>
        {formData.projects.map((project, index) => (
          <div key={index} className="nested-item">
            <div className="nested-item-header">
              <h4>Project {index + 1}</h4>
              <button type="button" onClick={() => removeProject(index)} className="remove-btn">
                Remove
              </button>
            </div>
            <div className="form-group">
              <label>Project Title *</label>
              <input
                type="text"
                value={project.title}
                onChange={(e) => updateProject(index, 'title', e.target.value)}
                placeholder="E-Commerce Platform"
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={project.description}
                onChange={(e) => updateProject(index, 'description', e.target.value)}
                placeholder="Brief description of the project"
                rows="2"
              />
            </div>
            <div className="form-group">
              <label>Technologies (comma-separated)</label>
              <input
                type="text"
                value={project.technologies}
                onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                placeholder="React, Node.js, MongoDB, AWS"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={project.startDate ? project.startDate.split('T')[0] : ''}
                  onChange={(e) => updateProject(index, 'startDate', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={project.endDate ? project.endDate.split('T')[0] : ''}
                  onChange={(e) => updateProject(index, 'endDate', e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>GitHub Link</label>
                <input
                  type="url"
                  value={project.githubLink}
                  onChange={(e) => updateProject(index, 'githubLink', e.target.value)}
                  placeholder="https://github.com/username/project"
                />
              </div>
              <div className="form-group">
                <label>Live/Demo Link</label>
                <input
                  type="url"
                  value={project.liveLink}
                  onChange={(e) => updateProject(index, 'liveLink', e.target.value)}
                  placeholder="https://demo.example.com"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Key Points/Achievements</label>
              {project.bullets.map((bullet, bulletIndex) => (
                <div key={bulletIndex} className="bullet-input">
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) => updateProjectBullet(index, bulletIndex, e.target.value)}
                    placeholder="Describe a key achievement or feature"
                  />
                  <button
                    type="button"
                    onClick={() => removeProjectBullet(index, bulletIndex)}
                    className="remove-bullet-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addProjectBullet(index)}
                className="add-bullet-btn"
              >
                + Add Point
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Publications */}
      <div className="form-section">
        <h3>Publications (Research Papers, Articles)</h3>
        <button type="button" onClick={addPublication} className="add-btn">
          + Add Publication
        </button>
        {formData.publications.map((pub, index) => (
          <div key={index} className="nested-item">
            <div className="nested-item-header">
              <h4>Publication {index + 1}</h4>
              <button type="button" onClick={() => removePublication(index)} className="remove-btn">
                Remove
              </button>
            </div>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={pub.title}
                onChange={(e) => updatePublication(index, 'title', e.target.value)}
                placeholder="AI-Based Resume Parser Using NLP"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Journal/Conference</label>
                <input
                  type="text"
                  value={pub.journal}
                  onChange={(e) => updatePublication(index, 'journal', e.target.value)}
                  placeholder="IEEE Conference on AI"
                />
              </div>
              <div className="form-group">
                <label>Year</label>
                <input
                  type="text"
                  value={pub.year}
                  onChange={(e) => updatePublication(index, 'year', e.target.value)}
                  placeholder="2024"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Paper Link (DOI or URL)</label>
              <input
                type="url"
                value={pub.paperLink}
                onChange={(e) => updatePublication(index, 'paperLink', e.target.value)}
                placeholder="https://doi.org/10.1234/example"
              />
            </div>
            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                value={pub.description}
                onChange={(e) => updatePublication(index, 'description', e.target.value)}
                placeholder="Brief description of the research"
                rows="2"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Certifications */}
      <div className="form-section">
        <h3>Certifications</h3>
        <button type="button" onClick={addCertification} className="add-btn">
          + Add Certification
        </button>
        {formData.certifications.map((cert, index) => (
          <div key={index} className="nested-item">
            <div className="nested-item-header">
              <h4>Certification {index + 1}</h4>
              <button type="button" onClick={() => removeCertification(index)} className="remove-btn">
                Remove
              </button>
            </div>
            <div className="form-group">
              <label>Certification Name *</label>
              <input
                type="text"
                value={cert.name}
                onChange={(e) => updateCertification(index, 'name', e.target.value)}
                placeholder="AWS Solutions Architect"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Issuer</label>
                <input
                  type="text"
                  value={cert.issuer}
                  onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                  placeholder="Amazon Web Services"
                />
              </div>
              <div className="form-group">
                <label>Issue Date</label>
                <input
                  type="date"
                  value={cert.issueDate ? cert.issueDate.split('T')[0] : ''}
                  onChange={(e) => updateCertification(index, 'issueDate', e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Certificate Link</label>
              <input
                type="url"
                value={cert.certLink}
                onChange={(e) => updateCertification(index, 'certLink', e.target.value)}
                placeholder="https://credentials.example.com/cert123"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Social Links */}
      <div className="form-section">
        <h3>Social Links & Profiles</h3>
        <button type="button" onClick={addSocialLink} className="add-btn">
          + Add Link
        </button>
        {formData.socialLinks.map((link, index) => (
          <div key={index} className="nested-item social-link-item">
            <div className="nested-item-header">
              <h4>Link {index + 1}</h4>
              <button type="button" onClick={() => removeSocialLink(index)} className="remove-btn">
                Remove
              </button>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Platform/Title *</label>
                <input
                  type="text"
                  value={link.title}
                  onChange={(e) => updateSocialLink(index, 'title', e.target.value)}
                  placeholder="GitHub, LinkedIn, Portfolio, etc."
                  required
                />
              </div>
              <div className="form-group">
                <label>Icon</label>
                <select
                  value={link.icon}
                  onChange={(e) => updateSocialLink(index, 'icon', e.target.value)}
                >
                  {iconOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>URL *</label>
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                placeholder="https://github.com/username"
                required
              />
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={link.displayInHeader}
                  onChange={(e) => updateSocialLink(index, 'displayInHeader', e.target.checked)}
                />
                Display in resume header
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="form-section">
        <h3>Achievements</h3>
        <div className="array-input">
          <input
            type="text"
            value={newAchievement}
            onChange={(e) => setNewAchievement(e.target.value)}
            placeholder="Add an achievement"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
          />
          <button type="button" onClick={addAchievement} className="add-btn">
            Add
          </button>
        </div>
        <div className="list-container">
          {formData.achievements.map((achievement, index) => (
            <div key={index} className="list-item">
              <span>{achievement}</span>
              <button type="button" onClick={() => removeAchievement(index)}>×</button>
            </div>
          ))}
        </div>
      </div>

      <button type="submit" className="save-btn" disabled={saving}>
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
};

export default ProfileForm;
