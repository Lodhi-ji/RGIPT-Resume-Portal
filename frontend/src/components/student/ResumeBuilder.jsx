import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/api';
import '../../styles/ResumeBuilder.css';

const ResumeBuilder = ({ resume, profile, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    template: 'template1',
    sectionsEnabled: {
      education: true,
      projects: true,
      internships: true,
      skills: true,
      achievements: true,
      certifications: true,
      positionsOfResponsibility: true,
      courses: true,
      socialLinks: true,
      publications: true,
    },
    selectedProjects: [],
    selectedInternships: [],
    selectedPublications: [],
    selectedCertifications: [],
    selectedSocialLinks: [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [previewHTML, setPreviewHTML] = useState('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const debounceTimerRef = useRef(null);

  // Safety check for profile
  if (!profile) {
    return (
      <div className="modal-overlay">
        <div className="resume-builder-split">
          <div className="builder-controls">
            <div className="builder-header">
              <h2>Error</h2>
              <button className="close-btn" onClick={onClose}>×</button>
            </div>
            <div style={{ padding: '24px' }}>
              <p>Profile data is not available. Please complete your profile first.</p>
              <button onClick={onClose} className="save-btn" style={{ marginTop: '16px' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (resume) {
      setFormData({
        name: resume.name,
        template: resume.template,
        sectionsEnabled: {
          education: resume.sectionsEnabled?.education ?? true,
          projects: resume.sectionsEnabled?.projects ?? true,
          internships: resume.sectionsEnabled?.internships ?? true,
          skills: resume.sectionsEnabled?.skills ?? true,
          achievements: resume.sectionsEnabled?.achievements ?? true,
          certifications: resume.sectionsEnabled?.certifications ?? true,
          positionsOfResponsibility: resume.sectionsEnabled?.positionsOfResponsibility ?? true,
          courses: resume.sectionsEnabled?.courses ?? true,
          socialLinks: resume.sectionsEnabled?.socialLinks ?? true,
          publications: resume.sectionsEnabled?.publications ?? true,
        },
        selectedProjects: resume.selectedProjects?.map(id => id.toString()) || [],
        selectedInternships: resume.selectedInternships?.map(id => id.toString()) || [],
        selectedPublications: resume.selectedPublications?.map(id => id.toString()) || [],
        selectedCertifications: resume.selectedCertifications?.map(id => id.toString()) || [],
        selectedSocialLinks: resume.selectedSocialLinks?.map(id => id.toString()) || [],
      });
    }
  }, [resume]);

  // Debounced preview generation
  const generatePreview = useCallback(async () => {
    if (!resume?._id) return;
    
    setIsLoadingPreview(true);
    try {
      const response = await api.get(`/resume-versions/${resume._id}/preview`);
      setPreviewHTML(response.data.html);
    } catch (err) {
      console.error('Preview generation failed:', err);
      setPreviewHTML('');
    } finally {
      setIsLoadingPreview(false);
    }
  }, [resume]);

  // Auto-save for existing resumes (for live preview)
  const autoSave = useCallback(async () => {
    if (!resume?._id) return; // Only auto-save existing resumes
    
    try {
      await api.put(`/resume-versions/${resume._id}`, formData);
      // After auto-save, generate preview
      await generatePreview();
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  }, [resume, formData, generatePreview]);

  // Trigger auto-save and preview update with debounce when form data changes
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (resume?._id) {
        autoSave();
      }
    }, 800);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [formData, autoSave, resume]);

  // Initial preview load
  useEffect(() => {
    if (resume?._id) {
      generatePreview();
    }
  }, [resume, generatePreview]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSectionToggle = (section) => {
    setFormData({
      ...formData,
      sectionsEnabled: {
        ...formData.sectionsEnabled,
        [section]: !formData.sectionsEnabled[section],
      },
    });
  };

  const handleProjectToggle = (projectId) => {
    const selected = formData.selectedProjects.includes(projectId);
    setFormData({
      ...formData,
      selectedProjects: selected
        ? formData.selectedProjects.filter(id => id !== projectId)
        : [...formData.selectedProjects, projectId],
    });
  };

  const handleInternshipToggle = (internshipId) => {
    const selected = formData.selectedInternships.includes(internshipId);
    setFormData({
      ...formData,
      selectedInternships: selected
        ? formData.selectedInternships.filter(id => id !== internshipId)
        : [...formData.selectedInternships, internshipId],
    });
  };

  const handlePublicationToggle = (publicationId) => {
    const selected = formData.selectedPublications.includes(publicationId);
    setFormData({
      ...formData,
      selectedPublications: selected
        ? formData.selectedPublications.filter(id => id !== publicationId)
        : [...formData.selectedPublications, publicationId],
    });
  };

  const handleCertificationToggle = (certificationId) => {
    const selected = formData.selectedCertifications.includes(certificationId);
    setFormData({
      ...formData,
      selectedCertifications: selected
        ? formData.selectedCertifications.filter(id => id !== certificationId)
        : [...formData.selectedCertifications, certificationId],
    });
  };

  const handleSocialLinkToggle = (socialLinkId) => {
    const selected = formData.selectedSocialLinks.includes(socialLinkId);
    setFormData({
      ...formData,
      selectedSocialLinks: selected
        ? formData.selectedSocialLinks.filter(id => id !== socialLinkId)
        : [...formData.selectedSocialLinks, socialLinkId],
    });
  };

  const handleRefreshPreview = () => {
    if (resume?._id) {
      generatePreview();
    }
  };

  const handleDownloadPDF = async () => {
    if (!resume?._id) return;
    
    try {
      const response = await api.get(`/resume-versions/${resume._id}/generate`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${formData.name || 'resume'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download PDF');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (resume) {
        await api.put(`/resume-versions/${resume._id}`, formData);
      } else {
        await api.post('/resume-versions', formData);
      }
      
      // Close the modal and refresh the list
      onClose();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="resume-builder-split">
        {/* Left Panel - Controls */}
        <div className="builder-controls">
          <div className="builder-header">
            <h2>{resume ? 'Edit Resume' : 'Create New Resume'}</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>

          <form onSubmit={handleSubmit} className="builder-form">
            {error && <div className="error-message">{error}</div>}

            {/* Basic Info */}
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-group">
                <label>Resume Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Software Developer Resume"
                  required
                />
              </div>

              <div className="form-group">
                <label>Template</label>
                <select name="template" value={formData.template} onChange={handleChange}>
                  <option value="template1">Template 1 - Modern</option>
                  <option value="template2">Template 2 - Sidebar</option>
                  <option value="template3">Template 3 - Minimal</option>
                  <option value="template4">Template 4 - LaTeX (RGIPT)</option>
                </select>
              </div>
            </div>

            {/* Sections */}
            <div className="form-section">
              <h3>Enable/Disable Sections</h3>
              <div className="sections-grid">
                {Object.keys(formData.sectionsEnabled).map((section) => (
                  <label key={section} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.sectionsEnabled[section]}
                      onChange={() => handleSectionToggle(section)}
                    />
                    <span>{formatSectionName(section)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Projects Selection */}
            {profile?.projects && profile.projects.length > 0 && (
              <div className="form-section">
                <h3>Select Projects</h3>
                <div className="items-list">
                  {profile.projects.map((project) => (
                    <label key={project._id} className="item-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.selectedProjects.includes(project._id.toString())}
                        onChange={() => handleProjectToggle(project._id.toString())}
                      />
                      <div className="item-info">
                        <strong>{project.title}</strong>
                        <small>{typeof project.technologies === 'string' ? project.technologies : project.technologies?.join(', ')}</small>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Internships Selection */}
            {profile?.internships && profile.internships.length > 0 && (
              <div className="form-section">
                <h3>Select Internships</h3>
                <div className="items-list">
                  {profile.internships.map((internship) => (
                    <label key={internship._id} className="item-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.selectedInternships.includes(internship._id.toString())}
                        onChange={() => handleInternshipToggle(internship._id.toString())}
                      />
                      <div className="item-info">
                        <strong>{internship.role}</strong>
                        <small>{internship.company}</small>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Publications Selection */}
            {profile?.publications && profile.publications.length > 0 && (
              <div className="form-section">
                <h3>Select Publications</h3>
                <div className="items-list">
                  {profile.publications.map((publication) => (
                    <label key={publication._id} className="item-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.selectedPublications.includes(publication._id.toString())}
                        onChange={() => handlePublicationToggle(publication._id.toString())}
                      />
                      <div className="item-info">
                        <strong>{publication.title}</strong>
                        <small>{publication.journal} ({publication.year})</small>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications Selection */}
            {profile?.certifications && profile.certifications.length > 0 && (
              <div className="form-section">
                <h3>Select Certifications</h3>
                <div className="items-list">
                  {profile.certifications.map((certification) => (
                    <label key={certification._id} className="item-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.selectedCertifications.includes(certification._id.toString())}
                        onChange={() => handleCertificationToggle(certification._id.toString())}
                      />
                      <div className="item-info">
                        <strong>{certification.name}</strong>
                        <small>{certification.issuer}</small>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links Selection */}
            {profile?.socialLinks && Array.isArray(profile.socialLinks) && profile.socialLinks.length > 0 && (
              <div className="form-section">
                <h3>Select Social Links</h3>
                <div className="items-list">
                  {profile.socialLinks.map((link) => (
                    <label key={link._id} className="item-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.selectedSocialLinks.includes(link._id.toString())}
                        onChange={() => handleSocialLinkToggle(link._id.toString())}
                      />
                      <div className="item-info">
                        <strong>{link.title}</strong>
                        <small>{link.url}</small>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? 'Saving...' : resume ? 'Update Resume' : 'Create Resume'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel - Live Preview */}
        <div className="builder-preview">
          <div className="preview-toolbar">
            <h3>Live Preview</h3>
            <div className="preview-actions">
              <button 
                type="button" 
                className="refresh-btn" 
                onClick={handleRefreshPreview}
                disabled={isLoadingPreview}
              >
                {isLoadingPreview ? '⟳ Loading...' : '⟳ Refresh'}
              </button>
              {resume && (
                <button 
                  type="button" 
                  className="download-btn" 
                  onClick={handleDownloadPDF}
                >
                  ⬇ Download PDF
                </button>
              )}
            </div>
          </div>
          <div className="preview-container">
            {isLoadingPreview && <div className="preview-loading">Generating preview...</div>}
            {!resume && !previewHTML && (
              <div className="preview-placeholder">
                Save the resume first to see live preview
              </div>
            )}
            {previewHTML && (
              <iframe
                className="resume-preview-iframe"
                srcDoc={previewHTML}
                title="Resume Preview"
                sandbox="allow-same-origin"
                scrolling="yes"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const formatSectionName = (name) => {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

export default ResumeBuilder;
