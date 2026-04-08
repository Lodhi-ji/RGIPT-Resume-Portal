import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/api';
import PdfDownloadOverlay from '../common/PdfDownloadOverlay';

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

const formatSectionName = (key) => {
  const names = {
    education: 'Education',
    projects: 'Projects',
    internships: 'Internships',
    skills: 'Skills',
    achievements: 'Achievements',
    certifications: 'Certifications',
    positionsOfResponsibility: 'Positions of Responsibility',
    courses: 'Courses',
    publications: 'Publications',
    extracurricular: 'Extracurricular',
    socialLinks: 'Social Links',
    dob: 'DOB',
    gender: 'Gender',
    objective: 'Objective',
  };
  return names[key] || key.charAt(0).toUpperCase() + key.slice(1);
};

const Toggle = ({ on }) => (
  <div style={{ width: '36px', height: '20px', borderRadius: '10px', background: on ? '#3b82f6' : '#4b5563', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
    <div style={{ position: 'absolute', top: '3px', left: on ? '18px' : '3px', width: '14px', height: '14px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
  </div>
);
const Empty = () => <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', padding: '32px 0' }}>No items available. Add them to your profile first.</p>;

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
      dob: true,
      gender: true,
      objective: true,
    },
    selectedProjects: [],
    selectedInternships: [],
    selectedPublications: [],
    selectedCertifications: [],
    selectedSocialLinks: [],
    selectedAchievements: [],
    selectedCourses: [],
    selectedPositionsOfResponsibility: [],
    selectedSkillCategories: [],
    selectedExtracurricular: [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [previewHTML, setPreviewHTML] = useState('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
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
          dob: resume.sectionsEnabled?.dob ?? true,
          gender: resume.sectionsEnabled?.gender ?? true,
          objective: resume.sectionsEnabled?.objective ?? true,
        },
        selectedProjects: resume.selectedProjects?.map(id => id.toString()) || [],
        selectedInternships: resume.selectedInternships?.map(id => id.toString()) || [],
        selectedPublications: resume.selectedPublications?.map(id => id.toString()) || [],
        selectedCertifications: resume.selectedCertifications?.map(id => id.toString()) || [],
        selectedSocialLinks: resume.selectedSocialLinks?.map(id => id.toString()) || [],
        selectedAchievements: resume.selectedAchievements || [],
        selectedCourses: resume.selectedCourses?.map(id => id.toString()) || [],
        selectedPositionsOfResponsibility: resume.selectedPositionsOfResponsibility?.map(id => id.toString()) || [],
        selectedSkillCategories: resume.selectedSkillCategories || [],
        selectedExtracurricular: resume.selectedExtracurricular || [],
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
    setDownloadingPdf(true);
    try {
      console.log('Downloading PDF for resume:', resume._id);
      const response = await api.get(`/resume-versions/${resume._id}/generate`, {
        responseType: 'blob',
      });
      if (!(response.data instanceof Blob)) throw new Error('Invalid response format');
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${formData.name || 'resume'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download error:', err);
      setError(err.response?.data?.error?.message || err.message || 'Failed to download PDF');
    } finally {
      setDownloadingPdf(false);
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
      <PdfDownloadOverlay visible={downloadingPdf} />
      <div className="bg-gray-50 w-full h-full flex flex-col">
        {/* Fixed Toolbar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-3">
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
                  {isLoadingPreview ? 'Loading...' : 'Preview'}
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
                    Download PDF
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
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6">
              
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
                  {/* Template Selection — compact */}
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-sm font-semibold text-gray-700 mb-3">Choose Template</h2>
                    <div className="flex gap-3">
                      {[{ value: 'template1', name: 'Template 1' }, { value: 'template2', name: 'Template 2' }].map(t => (
                        <button key={t.value} type="button" onClick={() => setFormData({ ...formData, template: t.value })}
                          className={`flex-1 py-2 px-4 rounded-lg border-2 text-sm font-semibold transition-all ${formData.template === t.value ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resume Content — clean sidebar + content panel */}
                  <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                    <div className="px-5 py-3 border-b border-gray-200">
                      <h2 className="text-base font-semibold text-gray-900">Resume Content</h2>
                    </div>
                    <div className="flex" style={{ minHeight: '420px' }}>
                      {/* Sidebar */}
                      <div className="flex-shrink-0 overflow-y-auto border-r border-gray-200" style={{ width: '200px', background: '#f9fafb' }}>
                        {[
                          { label: 'BASIC', items: [
                            { id: 'objective', label: 'Objective', count: null, total: null },
                            { id: 'personal', label: 'Personal Info', count: null, total: null },
                          ]},
                          { label: 'SECTIONS', items: [
                            { id: 'achievements', label: 'Achievements', count: formData.selectedAchievements.length, total: profile?.achievements?.length || 0 },
                            { id: 'projects', label: 'Projects', count: formData.selectedProjects.length, total: profile?.projects?.length || 0 },
                            { id: 'internships', label: 'Internships', count: formData.selectedInternships.length, total: profile?.internships?.length || 0 },
                            { id: 'skills', label: 'Skills', count: formData.selectedSkillCategories.length, total: (profile?.skills || []).filter(s => s && typeof s === 'object').length },
                          ]},
                          { label: 'ACADEMIC', items: [
                            { id: 'certifications', label: 'Certifications', count: formData.selectedCertifications.length, total: profile?.certifications?.length || 0 },
                            { id: 'courses', label: 'Courses', count: formData.selectedCourses.length, total: profile?.courses?.length || 0 },
                            { id: 'positions', label: 'Positions', count: formData.selectedPositionsOfResponsibility.length, total: profile?.positionsOfResponsibility?.length || 0 },
                            { id: 'publications', label: 'Publications', count: formData.selectedPublications.length, total: profile?.publications?.length || 0 },
                          ]},
                          { label: 'OTHER', items: [
                            { id: 'social', label: 'Social Links', count: formData.selectedSocialLinks.length, total: profile?.socialLinks?.length || 0 },
                            { id: 'extracurricular', label: 'Extracurricular', count: formData.selectedExtracurricular.length, total: profile?.extracurricular?.length || 0 },
                          ]},
                        ].map(group => (
                          <div key={group.label}>
                            <div className="px-4 pt-3 pb-1 text-xs font-bold text-gray-400 tracking-widest uppercase">{group.label}</div>
                            {group.items.map(item => {
                              const active = activeTab === item.id;
                              return (
                                <button key={item.id} type="button" onClick={() => setActiveTab(item.id)}
                                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-left ${active ? 'bg-white font-semibold text-blue-700 border-l-2 border-blue-600' : 'text-gray-600 hover:bg-white border-l-2 border-transparent'}`}>
                                  <span>{item.label}</span>
                                  {item.total > 0 && (
                                    <span className={`text-xs font-semibold rounded-full px-1.5 py-0.5 ${active ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>
                                      {item.count}/{item.total}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>

                      {/* Content panel */}
                      <div className="flex-1 overflow-y-auto p-5 bg-white">
                        {/* Section header with enable/disable toggle */}
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                          <span className="font-semibold text-gray-900 text-sm">
                            {activeTab === 'positions' ? 'Positions of Responsibility' : activeTab === 'social' ? 'Social Links' : activeTab === 'personal' ? 'Personal Info' : formatSectionName(activeTab)}
                          </span>
                          <div className="flex items-center gap-3">
                            {activeTab !== 'objective' && activeTab !== 'personal' && (
                              <>
                                <span className="text-xs text-gray-500">Include section</span>
                                {(() => {
                                  const sectionKey = activeTab === 'positions' ? 'positionsOfResponsibility' : activeTab === 'social' ? 'socialLinks' : activeTab;
                                  const enabled = formData.sectionsEnabled[sectionKey] ?? true;
                                  return (
                                    <div onClick={() => handleSectionToggle(sectionKey)} style={{ width: '36px', height: '20px', borderRadius: '10px', cursor: 'pointer', background: enabled ? '#2563eb' : '#d1d5db', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                                      <div style={{ position: 'absolute', top: '3px', left: enabled ? '18px' : '3px', width: '14px', height: '14px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                                    </div>
                                  );
                                })()}
                                <button type="button" onClick={() => {
                                  if (activeTab === 'projects') setFormData(f => ({ ...f, selectedProjects: [] }));
                                  else if (activeTab === 'internships') setFormData(f => ({ ...f, selectedInternships: [] }));
                                  else if (activeTab === 'certifications') setFormData(f => ({ ...f, selectedCertifications: [] }));
                                  else if (activeTab === 'publications') setFormData(f => ({ ...f, selectedPublications: [] }));
                                  else if (activeTab === 'achievements') setFormData(f => ({ ...f, selectedAchievements: [] }));
                                  else if (activeTab === 'courses') setFormData(f => ({ ...f, selectedCourses: [] }));
                                  else if (activeTab === 'positions') setFormData(f => ({ ...f, selectedPositionsOfResponsibility: [] }));
                                  else if (activeTab === 'social') setFormData(f => ({ ...f, selectedSocialLinks: [] }));
                                  else if (activeTab === 'skills') setFormData(f => ({ ...f, selectedSkillCategories: [] }));
                                  else if (activeTab === 'extracurricular') setFormData(f => ({ ...f, selectedExtracurricular: [] }));
                                }} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Deselect all</button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Objective */}
                        {activeTab === 'objective' && (
                          <div className="space-y-4">
                            <p className="text-sm text-gray-500">Control whether your career objective appears in the resume.</p>
                            <div className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${formData.sectionsEnabled.objective ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}
                              onClick={() => handleSectionToggle('objective')}>
                              <div>
                                <div className="text-sm font-medium text-gray-800">Include Objective Section</div>
                                <div className="text-xs text-gray-500 mt-0.5">{profile?.objective ? `"${profile.objective.slice(0, 60)}${profile.objective.length > 60 ? '...' : ''}"` : 'No objective set in profile'}</div>
                              </div>
                              <div style={{ width: '36px', height: '20px', borderRadius: '10px', background: formData.sectionsEnabled.objective ? '#2563eb' : '#d1d5db', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
                                <div style={{ position: 'absolute', top: '3px', left: formData.sectionsEnabled.objective ? '18px' : '3px', width: '14px', height: '14px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Personal Info */}
                        {activeTab === 'personal' && (
                          <div className="space-y-3">
                            <p className="text-sm text-gray-500">Choose which personal details appear in the resume header.</p>
                            {[
                              { key: 'dob', label: 'Date of Birth', value: 'Shows DOB in resume header' },
                              { key: 'gender', label: 'Gender', value: 'Shows Gender in resume header' },
                            ].map(({ key, label, value }) => (
                              <div key={key} className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${formData.sectionsEnabled[key] ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}
                                onClick={() => handleSectionToggle(key)}>
                                <div>
                                  <div className="text-sm font-medium text-gray-800">{label}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">{value}</div>
                                </div>
                                <div style={{ width: '36px', height: '20px', borderRadius: '10px', background: formData.sectionsEnabled[key] ? '#2563eb' : '#d1d5db', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
                                  <div style={{ position: 'absolute', top: '3px', left: formData.sectionsEnabled[key] ? '18px' : '3px', width: '14px', height: '14px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Skills — show categories with checkboxes */}
                        {activeTab === 'skills' && (
                          <div>
                            {(profile?.skills || []).filter(s => s && typeof s === 'object').length > 0 ? (
                              <div className="space-y-2">
                                {(profile.skills).filter(s => s && typeof s === 'object').map((cat, i) => {
                                  const sel = formData.selectedSkillCategories.includes(cat.category);
                                  return (
                                    <label key={i} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${sel ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                                      <input type="checkbox" checked={sel} onChange={() => {
                                        setFormData(f => ({
                                          ...f,
                                          selectedSkillCategories: sel
                                            ? f.selectedSkillCategories.filter(c => c !== cat.category)
                                            : [...f.selectedSkillCategories, cat.category]
                                        }));
                                      }} className="mt-0.5 w-4 h-4 text-blue-600 rounded" />
                                      <div>
                                        <div className="text-sm font-medium text-gray-800">{cat.category}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{(cat.items || []).join(', ')}</div>
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            ) : <p className="text-sm text-gray-400 text-center py-8">No skills added to your profile yet.</p>}
                          </div>
                        )}

                        {/* Extracurricular — individual item checkboxes */}
                        {activeTab === 'extracurricular' && (
                          <div>
                            {profile?.extracurricular?.length > 0 ? (
                              <div className="space-y-2">
                                {profile.extracurricular.map((a, i) => {
                                  const activityStr = typeof a === 'string' ? a : String(a);
                                  const sel = formData.selectedExtracurricular.map(x => String(x)).includes(activityStr);
                                  return (
                                    <div key={i} onClick={() => {
                                      setFormData(f => {
                                        const current = f.selectedExtracurricular.map(x => String(x));
                                        const updated = current.includes(activityStr)
                                          ? current.filter(x => x !== activityStr)
                                          : [...current, activityStr];
                                        return { ...f, selectedExtracurricular: updated };
                                      });
                                    }} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${sel ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                                      <div style={{ width: '16px', height: '16px', borderRadius: '3px', border: `2px solid ${sel ? '#2563eb' : '#9ca3af'}`, background: sel ? '#2563eb' : '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {sel && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                      </div>
                                      <span className="text-sm text-gray-800">{activityStr}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : <p className="text-sm text-gray-400 text-center py-8">No extracurricular activities added yet.</p>}
                          </div>
                        )}

                        {/* Selectable items */}
                        <div className="space-y-2">
                          {activeTab === 'projects' && (profile?.projects?.length > 0 ? profile.projects.map(p => {
                            const sel = formData.selectedProjects.includes(p._id.toString());
                            return (<label key={p._id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${sel ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                              <input type="checkbox" checked={sel} onChange={() => handleProjectToggle(p._id.toString())} className="w-4 h-4 text-blue-600 rounded" />
                              <span className="text-sm font-medium text-gray-800">{p.title}</span>
                            </label>);
                          }) : <p className="text-sm text-gray-400 text-center py-8">No projects in your profile.</p>)}

                          {activeTab === 'internships' && (profile?.internships?.length > 0 ? profile.internships.map(x => {
                            const sel = formData.selectedInternships.includes(x._id.toString());
                            return (<label key={x._id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${sel ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                              <input type="checkbox" checked={sel} onChange={() => handleInternshipToggle(x._id.toString())} className="w-4 h-4 text-blue-600 rounded" />
                              <div><div className="text-sm font-medium text-gray-800">{x.role}</div><div className="text-xs text-gray-500">{x.company}</div></div>
                            </label>);
                          }) : <p className="text-sm text-gray-400 text-center py-8">No internships in your profile.</p>)}

                          {activeTab === 'certifications' && (profile?.certifications?.length > 0 ? profile.certifications.map(c => {
                            const sel = formData.selectedCertifications.includes(c._id.toString());
                            return (<label key={c._id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${sel ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                              <input type="checkbox" checked={sel} onChange={() => handleCertificationToggle(c._id.toString())} className="w-4 h-4 text-blue-600 rounded" />
                              <div><div className="text-sm font-medium text-gray-800">{c.name}</div><div className="text-xs text-gray-500">{c.issuer}</div></div>
                            </label>);
                          }) : <p className="text-sm text-gray-400 text-center py-8">No certifications in your profile.</p>)}

                          {activeTab === 'publications' && (profile?.publications?.length > 0 ? profile.publications.map(p => {
                            const sel = formData.selectedPublications.includes(p._id.toString());
                            return (<label key={p._id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${sel ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                              <input type="checkbox" checked={sel} onChange={() => handlePublicationToggle(p._id.toString())} className="w-4 h-4 text-blue-600 rounded" />
                              <div><div className="text-sm font-medium text-gray-800">{p.title}</div><div className="text-xs text-gray-500">{p.journal}</div></div>
                            </label>);
                          }) : <p className="text-sm text-gray-400 text-center py-8">No publications in your profile.</p>)}

                          {activeTab === 'achievements' && (profile?.achievements?.length > 0 ? profile.achievements.map((a, i) => {
                            const sel = formData.selectedAchievements.includes(i);
                            return (<label key={i} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${sel ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                              <input type="checkbox" checked={sel} onChange={() => handleAchievementToggle(i)} className="w-4 h-4 text-blue-600 rounded" />
                              <span className="text-sm text-gray-800">{a}</span>
                            </label>);
                          }) : <p className="text-sm text-gray-400 text-center py-8">No achievements in your profile.</p>)}

                          {activeTab === 'courses' && (profile?.courses?.length > 0 ? profile.courses.map((c, i) => {
                            const id = c._id ? c._id.toString() : (typeof c === 'string' ? c : String(i));
                            const sel = formData.selectedCourses.includes(id);
                            const name = typeof c === 'string' ? c : c.name;
                            return (<label key={id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${sel ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                              <input type="checkbox" checked={sel} onChange={() => handleCourseToggle(id)} className="w-4 h-4 text-blue-600 rounded" />
                              <span className="text-sm font-medium text-gray-800">{name}</span>
                            </label>);
                          }) : <p className="text-sm text-gray-400 text-center py-8">No courses in your profile.</p>)}

                          {activeTab === 'positions' && (profile?.positionsOfResponsibility?.length > 0 ? profile.positionsOfResponsibility.map(p => {
                            const sel = formData.selectedPositionsOfResponsibility.includes(p._id.toString());
                            return (<label key={p._id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${sel ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                              <input type="checkbox" checked={sel} onChange={() => handlePositionToggle(p._id.toString())} className="w-4 h-4 text-blue-600 rounded" />
                              <div><div className="text-sm font-medium text-gray-800">{p.title}</div><div className="text-xs text-gray-500">{p.organization}</div></div>
                            </label>);
                          }) : <p className="text-sm text-gray-400 text-center py-8">No positions in your profile.</p>)}

                          {activeTab === 'social' && (profile?.socialLinks?.length > 0 ? profile.socialLinks.map(l => {
                            const sel = formData.selectedSocialLinks.includes(l._id.toString());
                            return (<label key={l._id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${sel ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                              <input type="checkbox" checked={sel} onChange={() => handleSocialLinkToggle(l._id.toString())} className="w-4 h-4 text-blue-600 rounded" />
                              <div><div className="text-sm font-medium text-gray-800">{l.title}</div><div className="text-xs text-gray-500 truncate">{l.url}</div></div>
                            </label>);
                          }) : <p className="text-sm text-gray-400 text-center py-8">No social links in your profile.</p>)}
                        </div>
                      </div>
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

export default ResumeBuilder;
