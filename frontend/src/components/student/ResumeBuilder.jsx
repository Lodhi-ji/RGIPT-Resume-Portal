import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/api';

// A4 at 96dpi = 794px wide × 1123px tall (one page height)
// We render the iframe at true 794px width then scale it down to fit the container.
// Page break lines are overlaid at every 1123px of content height.
const A4Preview = ({ html }) => {
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(1123);

  const A4_WIDTH = 794;
  const A4_PAGE_HEIGHT = 1123;

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setScale(containerWidth / A4_WIDTH);
      }
    };
    updateScale();
    const ro = new ResizeObserver(updateScale);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const handleIframeLoad = () => {
    try {
      const doc = iframeRef.current?.contentDocument;
      if (doc) {
        const h = doc.documentElement.scrollHeight;
        setContentHeight(Math.max(h, A4_PAGE_HEIGHT));
      }
    } catch (_) {}
  };

  const scaledHeight = contentHeight * scale;

  // Calculate page break positions (in scaled px)
  const pageBreaks = [];
  let breakAt = A4_PAGE_HEIGHT;
  while (breakAt < contentHeight) {
    pageBreaks.push(breakAt * scale);
    breakAt += A4_PAGE_HEIGHT;
  }

  return (
    <div ref={containerRef} className="relative w-full overflow-x-hidden" style={{ height: scaledHeight }}>
      {/* The iframe renders at true A4 width, scaled down */}
      <iframe
        ref={iframeRef}
        srcDoc={html}
        title="Resume Preview"
        sandbox="allow-same-origin"
        scrolling="no"
        onLoad={handleIframeLoad}
        style={{
          width: A4_WIDTH,
          height: contentHeight,
          border: 'none',
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
          display: 'block',
          background: '#fff',
        }}
      />
      {/* Page break overlays */}
      {pageBreaks.map((y, i) => (
        <div key={i} style={{ position: 'absolute', top: y, left: 0, right: 0, pointerEvents: 'none' }}>
          <div style={{ borderTop: '2px dashed #9ca3af', width: '100%' }} />
          <span style={{
            position: 'absolute', right: 6, top: 2,
            fontSize: 10, color: '#9ca3af', background: 'transparent',
            fontFamily: 'sans-serif'
          }}>
            Page {i + 2}
          </span>
        </div>
      ))}
    </div>
  );
};

const ResumeBuilder = ({ resume, profile, onClose }) => {
  const [activeTab, setActiveTab] = useState('basic');
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
      publications: true,
      extracurricular: true,
    },
    selectedProjects: [],
    selectedInternships: [],
    selectedPublications: [],
    selectedCertifications: [],
    selectedSocialLinks: [],
    selectedAchievements: [],
    selectedCourses: [],
    selectedPositionsOfResponsibility: [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [previewHTML, setPreviewHTML] = useState('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const debounceTimerRef = useRef(null);

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
          publications: resume.sectionsEnabled?.publications ?? true,
          extracurricular: resume.sectionsEnabled?.extracurricular ?? true,
        },
        selectedProjects: resume.selectedProjects?.map(id => id.toString()) || [],
        selectedInternships: resume.selectedInternships?.map(id => id.toString()) || [],
        selectedPublications: resume.selectedPublications?.map(id => id.toString()) || [],
        selectedCertifications: resume.selectedCertifications?.map(id => id.toString()) || [],
        selectedSocialLinks: resume.selectedSocialLinks?.map(id => id.toString()) || [],
        selectedAchievements: resume.selectedAchievements || [],
        selectedCourses: resume.selectedCourses?.map(id => id.toString()) || [],
        selectedPositionsOfResponsibility: resume.selectedPositionsOfResponsibility?.map(id => id.toString()) || [],
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

  const handleAchievementToggle = (index) => {
    const selected = formData.selectedAchievements.includes(index);
    setFormData({
      ...formData,
      selectedAchievements: selected
        ? formData.selectedAchievements.filter(i => i !== index)
        : [...formData.selectedAchievements, index],
    });
  };

  const handleCourseToggle = (courseId) => {
    const selected = formData.selectedCourses.includes(courseId);
    setFormData({
      ...formData,
      selectedCourses: selected
        ? formData.selectedCourses.filter(id => id !== courseId)
        : [...formData.selectedCourses, courseId],
    });
  };

  const handlePositionToggle = (positionId) => {
    const selected = formData.selectedPositionsOfResponsibility.includes(positionId);
    setFormData({
      ...formData,
      selectedPositionsOfResponsibility: selected
        ? formData.selectedPositionsOfResponsibility.filter(id => id !== positionId)
        : [...formData.selectedPositionsOfResponsibility, positionId],
    });
  };

  const handleRefreshPreview = () => {
    if (resume?._id) {
      generatePreview();
    }
  };

  const handleDownloadPDF = async () => {
    if (!resume?._id) {
      setError('No resume ID found. Please save the resume first.');
      return;
    }
    
    try {
      console.log('Downloading PDF for resume:', resume._id);
      const response = await api.get(`/resume-versions/${resume._id}/generate`, {
        responseType: 'blob',
      });
      
      console.log('PDF response received:', response);
      
      // Check if response is actually a blob
      if (!(response.data instanceof Blob)) {
        throw new Error('Invalid response format');
      }
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${formData.name || 'resume'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('PDF download triggered successfully');
    } catch (err) {
      console.error('PDF download error:', err);
      const errorMessage = err.response?.data?.error?.message || err.message || 'Failed to download PDF';
      setError(errorMessage);
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

  // Safety check for profile - render error state if profile is missing
  if (!profile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Error</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
            >
              ×
            </button>
          </div>
          <div className="mb-6">
            <p className="text-gray-700">Profile data is not available. Please complete your profile first.</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-hidden">
      <div className="bg-gray-50 w-full h-full flex flex-col">
        {/* Fixed Toolbar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                  aria-label="Close"
                >
                  ×
                </button>
                <h1 className="text-xl font-semibold text-gray-900">
                  {resume ? 'Edit Resume' : 'Create New Resume'}
                </h1>
              </div>
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={handleRefreshPreview}
                  disabled={isLoadingPreview}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingPreview ? '⟳ Loading...' : '⟳ Preview'}
                </button>
                <button 
                  type="submit"
                  form="resume-form"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : resume ? 'Update' : 'Save'}
                </button>
                {resume && (
                  <button 
                    type="button"
                    onClick={handleDownloadPDF}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors duration-200"
                  >
                    ⬇ Download PDF
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 pt-4 w-full">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Two-Panel Layout */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8">
              
              {/* Left Panel: Editor */}
              <div className="space-y-6">
                <form id="resume-form" onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Basic Information Section */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Basic Information
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Resume Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g., Software Developer Resume"
                          required
                          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Template Selection Section */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Choose Template
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: 'template1', name: 'Template 1' },
                        { value: 'template2', name: 'Template 2' }
                      ].map((template) => (
                        <button
                          key={template.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, template: template.value })}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.template === template.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="aspect-[8.5/11] bg-gray-100 rounded mb-2 flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 text-center">
                            {template.name}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tabbed Content Sections */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Resume Content
                    </h2>
                    
                    {/* Section Tabs */}
                    <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
                      {[
                        { id: 'basic', label: 'Sections' },
                        { id: 'projects', label: 'Projects' },
                        { id: 'internships', label: 'Internships' },
                        { id: 'publications', label: 'Publications' },
                        { id: 'certifications', label: 'Certifications' },
                        { id: 'achievements', label: 'Achievements' },
                        { id: 'courses', label: 'Courses' },
                        { id: 'positions', label: 'Positions' },
                        { id: 'social', label: 'Social Links' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${
                            activeTab === tab.id
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-4">
                      {/* Sections Tab */}
                      {activeTab === 'basic' && (
                        <div className="grid grid-cols-2 gap-3">
                          {Object.keys(formData.sectionsEnabled).map((section) => (
                            <label key={section} className="flex items-center gap-2 p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.sectionsEnabled[section]}
                                onChange={() => handleSectionToggle(section)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                {formatSectionName(section)}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Projects Tab */}
                      {activeTab === 'projects' && (
                        <div className="space-y-3">
                          {profile?.projects && profile.projects.length > 0 ? (
                            profile.projects.map((project) => (
                              <label key={project._id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer border-2 border-transparent hover:border-blue-200">
                                <input
                                  type="checkbox"
                                  checked={formData.selectedProjects.includes(project._id.toString())}
                                  onChange={() => handleProjectToggle(project._id.toString())}
                                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">{project.title}</p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {typeof project.technologies === 'string' ? project.technologies : project.technologies?.join(', ')}
                                  </p>
                                </div>
                              </label>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-8">No projects available. Add projects to your profile first.</p>
                          )}
                        </div>
                      )}

                      {/* Internships Tab */}
                      {activeTab === 'internships' && (
                        <div className="space-y-3">
                          {profile?.internships && profile.internships.length > 0 ? (
                            profile.internships.map((internship) => (
                              <label key={internship._id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer border-2 border-transparent hover:border-blue-200">
                                <input
                                  type="checkbox"
                                  checked={formData.selectedInternships.includes(internship._id.toString())}
                                  onChange={() => handleInternshipToggle(internship._id.toString())}
                                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">{internship.role}</p>
                                  <p className="text-sm text-gray-600 mt-1">{internship.company}</p>
                                </div>
                              </label>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-8">No internships available. Add internships to your profile first.</p>
                          )}
                        </div>
                      )}

                      {/* Publications Tab */}
                      {activeTab === 'publications' && (
                        <div className="space-y-3">
                          {profile?.publications && profile.publications.length > 0 ? (
                            profile.publications.map((publication) => (
                              <label key={publication._id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer border-2 border-transparent hover:border-blue-200">
                                <input
                                  type="checkbox"
                                  checked={formData.selectedPublications.includes(publication._id.toString())}
                                  onChange={() => handlePublicationToggle(publication._id.toString())}
                                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">{publication.title}</p>
                                  <p className="text-sm text-gray-600 mt-1">{publication.journal} ({publication.year})</p>
                                </div>
                              </label>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-8">No publications available. Add publications to your profile first.</p>
                          )}
                        </div>
                      )}

                      {/* Certifications Tab */}
                      {activeTab === 'certifications' && (
                        <div className="space-y-3">
                          {profile?.certifications && profile.certifications.length > 0 ? (
                            profile.certifications.map((certification) => (
                              <label key={certification._id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer border-2 border-transparent hover:border-blue-200">
                                <input
                                  type="checkbox"
                                  checked={formData.selectedCertifications.includes(certification._id.toString())}
                                  onChange={() => handleCertificationToggle(certification._id.toString())}
                                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">{certification.name}</p>
                                  <p className="text-sm text-gray-600 mt-1">{certification.issuer}</p>
                                </div>
                              </label>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-8">No certifications available. Add certifications to your profile first.</p>
                          )}
                        </div>
                      )}

                      {/* Achievements Tab */}
                      {activeTab === 'achievements' && (
                        <div className="space-y-3">
                          {profile?.achievements && profile.achievements.length > 0 ? (
                            profile.achievements.map((achievement, index) => (
                              <label key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer border-2 border-transparent hover:border-blue-200">
                                <input
                                  type="checkbox"
                                  checked={formData.selectedAchievements.includes(index)}
                                  onChange={() => handleAchievementToggle(index)}
                                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="flex-1 text-sm text-gray-900">{achievement}</p>
                              </label>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-8">No achievements available. Add achievements to your profile first.</p>
                          )}
                        </div>
                      )}

                      {/* Courses Tab */}
                      {activeTab === 'courses' && (
                        <div className="space-y-3">
                          {profile?.courses && profile.courses.length > 0 ? (
                            profile.courses.map((course) => (
                              <label key={course._id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer border-2 border-transparent hover:border-blue-200">
                                <input
                                  type="checkbox"
                                  checked={formData.selectedCourses.includes(course._id.toString())}
                                  onChange={() => handleCourseToggle(course._id.toString())}
                                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">{course.name}</p>
                                  {course.platform && <p className="text-sm text-gray-600 mt-1">{course.platform}</p>}
                                </div>
                              </label>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-8">No courses available. Add courses to your profile first.</p>
                          )}
                        </div>
                      )}

                      {/* Positions of Responsibility Tab */}
                      {activeTab === 'positions' && (
                        <div className="space-y-3">
                          {profile?.positionsOfResponsibility && profile.positionsOfResponsibility.length > 0 ? (
                            profile.positionsOfResponsibility.map((position) => (
                              <label key={position._id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer border-2 border-transparent hover:border-blue-200">
                                <input
                                  type="checkbox"
                                  checked={formData.selectedPositionsOfResponsibility.includes(position._id.toString())}
                                  onChange={() => handlePositionToggle(position._id.toString())}
                                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">{position.title}</p>
                                  {position.organization && <p className="text-sm text-gray-600 mt-1">{position.organization}</p>}
                                </div>
                              </label>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-8">No positions available. Add positions of responsibility to your profile first.</p>
                          )}
                        </div>
                      )}

                      {/* Social Links Tab */}
                      {activeTab === 'social' && (
                        <div className="space-y-3">
                          {profile?.socialLinks && Array.isArray(profile.socialLinks) && profile.socialLinks.length > 0 ? (
                            profile.socialLinks.map((link) => (
                              <label key={link._id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer border-2 border-transparent hover:border-blue-200">
                                <input
                                  type="checkbox"
                                  checked={formData.selectedSocialLinks.includes(link._id.toString())}
                                  onChange={() => handleSocialLinkToggle(link._id.toString())}
                                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">{link.title}</p>
                                  <p className="text-sm text-gray-600 mt-1 break-all">{link.url}</p>
                                </div>
                              </label>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-8">No social links available. Add social links to your profile first.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              {/* Right Panel: Live Preview */}
              <div className="lg:sticky lg:top-24 lg:self-start">
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-semibold text-gray-900">Live Preview</h2>
                    {isLoadingPreview && (
                      <span className="text-sm text-blue-600 font-medium">Updating...</span>
                    )}
                  </div>

                  {/* A4 preview container */}
                  <div className="border border-gray-300 rounded overflow-hidden bg-gray-100">
                    {!resume && !previewHTML ? (
                      <div className="flex items-center justify-center p-8" style={{ aspectRatio: '1/1.414' }}>
                        <div className="text-center">
                          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-gray-500 text-sm">Save the resume first to see live preview</p>
                        </div>
                      </div>
                    ) : previewHTML ? (
                      <A4Preview html={previewHTML} />
                    ) : null}
                  </div>

                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Preview matches PDF output · Dashed line = page break
                  </p>
                </div>
              </div>
            </div>
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
