const fs = require('fs').promises;
const path = require('path');
const { formatDate, formatDateRange } = require('../utils/helpers');

// Icon mapping for social links
const iconMap = {
  'github': 'fab fa-github',
  'linkedin': 'fab fa-linkedin',
  'leetcode': 'fas fa-code',
  'codeforces': 'fas fa-laptop-code',
  'portfolio': 'fas fa-globe',
  'website': 'fas fa-globe',
  'twitter': 'fab fa-twitter',
  'medium': 'fab fa-medium',
  'youtube': 'fab fa-youtube',
  'instagram': 'fab fa-instagram',
  'facebook': 'fab fa-facebook',
  'default': 'fas fa-link'
};

class TemplateService {
  // Load template file
  async getTemplate(templateName) {
    try {
      const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
      const template = await fs.readFile(templatePath, 'utf-8');
      return template;
    } catch (error) {
      throw new Error(`Failed to load template ${templateName}: ${error.message}`);
    }
  }

  // Render skills for template1 (tags)
  renderSkillsTags(skills) {
    return skills.map(skill => 
      `<span class="skill-tag">${skill}</span>`
    ).join('\n        ');
  }

  // Render skills for text format
  renderSkillsText(skills) {
    return skills.join(' • ');
  }

  // Render projects
  renderProjects(projects, template) {
    if (template === 'template1') {
      return projects.map(project => {
        const techStr = typeof project.technologies === 'string' 
          ? project.technologies 
          : (Array.isArray(project.technologies) ? project.technologies.join(', ') : '');
        
        let linksHtml = '';
        if (project.githubLink) linksHtml += `<a href="${project.githubLink}" target="_blank"><i class="fab fa-github"></i></a> `;
        if (project.liveLink) linksHtml += `<a href="${project.liveLink}" target="_blank"><i class="fas fa-external-link-alt"></i></a>`;
        
        return `
      <div class="experience-item">
        <div class="item-header">
          <div>
            <div class="item-title">${project.title} ${linksHtml}</div>
            ${project.description ? `<div class="item-subtitle">${project.description}</div>` : ''}
          </div>
          ${project.startDate ? `<div class="item-date">${formatDateRange(project.startDate, project.endDate)}</div>` : ''}
        </div>
        ${techStr ? `<div class="technologies"><strong>Technologies:</strong> ${techStr}</div>` : ''}
        ${project.bullets && project.bullets.length > 0 ? 
          `<ul>${project.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
      </div>`;
      }).join('\n      ');
    }
    // template4 uses different rendering (handled in replacePlaceholders)
    return '';
  }

  // Render internships
  renderInternships(internships, template) {
    if (template === 'template1') {
      return internships.map(internship => `
      <div class="experience-item">
        <div class="item-header">
          <div>
            <div class="item-title">${internship.role}</div>
            <div class="item-subtitle">${internship.company}${internship.location ? ` • ${internship.location}` : ''}</div>
          </div>
          ${internship.startDate ? `<div class="item-date">${formatDateRange(internship.startDate, internship.endDate)}</div>` : ''}
        </div>
        ${internship.description ? `<div class="item-description">${internship.description}</div>` : ''}
      </div>`).join('\n      ');
    }
    // template4 uses different rendering (handled in replacePlaceholders)
    return '';
  }

  // Render achievements
  renderAchievements(achievements, template) {
    // template1 uses list format
    return achievements.map(achievement => 
      `<li>${achievement}</li>`
    ).join('\n          ');
  }

  // Render certifications
  renderCertifications(certifications, template) {
    if (template === 'template1') {
      return certifications.map(cert => {
        let text = cert.name;
        if (cert.issuer) text += ` - ${cert.issuer}`;
        if (cert.issueDate) text += ` (${formatDate(cert.issueDate)})`;
        if (cert.certLink) text += ` <a href="${cert.certLink}" target="_blank"><i class="fas fa-external-link-alt"></i></a>`;
        return `<li>${text}</li>`;
      }).join('\n          ');
    }
    // template2 uses different rendering (handled in replacePlaceholders)
    return '';
  }

  // Render positions of responsibility
  renderPOR(positions, template) {
    if (template === 'template1') {
      return positions.map(pos => `
      <div class="experience-item">
        <div class="item-header">
          <div>
            <div class="item-title">${pos.title}</div>
            ${pos.organization ? `<div class="item-subtitle">${pos.organization}</div>` : ''}
          </div>
          ${pos.startDate ? `<div class="item-date">${formatDateRange(pos.startDate, pos.endDate)}</div>` : ''}
        </div>
        ${pos.description ? `<div class="item-description">${pos.description}</div>` : ''}
      </div>`).join('\n      ');
    }
    // template4 uses different rendering (handled in replacePlaceholders)
    return '';
  }

  // Render courses
  renderCourses(courses, template) {
    if (template === 'template1') {
      return courses.map(course => {
        const parts = [course.name];
        if (course.platform) parts.push(course.platform);
        if (course.completionDate) parts.push(formatDate(course.completionDate));
        return `<div class="experience-item"><div class="item-title">${parts.join(' • ')}</div></div>`;
      }).join('\n      ');
    }
    // template2 uses different rendering (handled in replacePlaceholders)
    return '';
  }

  // Render social links
  renderSocialLinks(socialLinks, template) {
    // Handle both old object format and new array format
    let links = [];
    
    if (Array.isArray(socialLinks)) {
      // New format: array of objects
      links = socialLinks.map(link => ({
        name: link.title,
        url: link.url,
        icon: iconMap[link.icon] || iconMap.default
      }));
    } else if (socialLinks && typeof socialLinks === 'object') {
      // Old format: object with predefined keys
      if (socialLinks.github) links.push({ name: 'GitHub', url: socialLinks.github, icon: iconMap.github });
      if (socialLinks.linkedin) links.push({ name: 'LinkedIn', url: socialLinks.linkedin, icon: iconMap.linkedin });
      if (socialLinks.codeforces) links.push({ name: 'Codeforces', url: socialLinks.codeforces, icon: iconMap.codeforces });
      if (socialLinks.leetcode) links.push({ name: 'LeetCode', url: socialLinks.leetcode, icon: iconMap.leetcode });
      if (socialLinks.portfolio) links.push({ name: 'Portfolio', url: socialLinks.portfolio, icon: iconMap.portfolio });
    }

    // template1 format
    return links.map(link => 
      `<a href="${link.url}" class="social-link" target="_blank"><i class="${link.icon}"></i> ${link.name}</a>`
    ).join('\n        ');
  }

  // Render publications (NEW)
  renderPublications(publications, template) {
    if (template === 'template1') {
      return publications.map(pub => {
        let html = `<li><strong>${pub.title}</strong>`;
        if (pub.journal) html += ` - <em>${pub.journal}</em>`;
        if (pub.year) html += ` (${pub.year})`;
        if (pub.paperLink) html += ` <a href="${pub.paperLink}" target="_blank"><i class="fas fa-external-link-alt"></i></a>`;
        html += '</li>';
        return html;
      }).join('\n          ');
    }
    // template2 uses different rendering (handled in replacePlaceholders)
    return '';
  }

  // Replace placeholders in template
  async replacePlaceholders(template, data, sectionsEnabled, templateName) {
    let html = template;

    // Replace basic info
    html = html.replace(/{{name}}/g, data.name || '');
    html = html.replace(/{{email}}/g, data.email || '');
    html = html.replace(/{{phone}}/g, data.phone || '');
    html = html.replace(/{{alternateEmail}}/g, data.alternateEmail || '');
    html = html.replace(/{{degree}}/g, data.degree || '');
    html = html.replace(/{{branch}}/g, data.branch || '');
    html = html.replace(/{{rollNo}}/g, data.rollNo || '');
    html = html.replace(/{{institute}}/g, 'Rajiv Gandhi Institute of Petroleum Technology');
    html = html.replace(/{{cpi}}/g, data.cpi || '');
    html = html.replace(/{{class10Percentage}}/g, data.class10Percentage || '');
    html = html.replace(/{{class10School}}/g, data.class10School || '');
    html = html.replace(/{{class12Percentage}}/g, data.class12Percentage || '');
    html = html.replace(/{{class12School}}/g, data.class12School || '');

    // Template 1 and Template 2 use the same layout now
    if (templateName === 'template2' || templateName === 'template1') {
      // Load and encode logo
      const logoBase64 = await this.getLogoBase64();
      html = html.replace(/{{logoBase64}}/g, logoBase64);
      
      // Format phone number with +91- prefix
      let phoneFormatted = '';
      if (data.phone) {
        const phoneNum = data.phone.toString().replace(/\D/g, ''); // Remove non-digits
        if (phoneNum.length === 10) {
          phoneFormatted = `+91-${phoneNum}`;
        } else if (phoneNum.startsWith('91') && phoneNum.length === 12) {
          phoneFormatted = `+91-${phoneNum.substring(2)}`;
        } else {
          phoneFormatted = data.phone;
        }
      }
      
      // Replace contact info HTML
      html = html.replace(/{{phoneHtml}}/g, phoneFormatted ? `<div>${phoneFormatted}</div>` : '');
      html = html.replace(/{{personalEmailHtml}}/g, data.alternateEmail ? `<div><a href="mailto:${data.alternateEmail}">${data.alternateEmail}</a></div>` : '');
      html = html.replace(/{{instituteEmailHtml}}/g, data.email ? `<div><a href="mailto:${data.email}">${data.email}</a></div>` : '');
      
      html = html.replace(/{{socialLinksHtml}}/g, sectionsEnabled.socialLinks ? this.renderTemplate2SocialLinksInline(data.socialLinks) : '');
      html = html.replace(/{{educationHtml}}/g, sectionsEnabled.education !== false ? this.renderTemplate2Education(data) : '');
      html = html.replace(/{{internshipsHtml}}/g, sectionsEnabled.internships !== false ? this.renderTemplate2Internships(data.internships) : '');
      html = html.replace(/{{projectsHtml}}/g, sectionsEnabled.projects !== false ? this.renderTemplate2Projects(data.projects) : '');
      html = html.replace(/{{publicationsHtml}}/g, sectionsEnabled.publications !== false ? this.renderTemplate2Publications(data.publications) : '');
      html = html.replace(/{{certificationsHtml}}/g, sectionsEnabled.certifications !== false ? this.renderTemplate2Certifications(data.certifications) : '');
      html = html.replace(/{{skillsHtml}}/g, sectionsEnabled.skills !== false ? this.renderTemplate2Skills(data.skills) : '');
      html = html.replace(/{{achievementsHtml}}/g, sectionsEnabled.achievements !== false ? this.renderTemplate2Achievements(data.achievements) : '');
      html = html.replace(/{{positionsHtml}}/g, sectionsEnabled.positionsOfResponsibility !== false ? this.renderTemplate2POR(data.positionsOfResponsibility) : '');
      html = html.replace(/{{coursesHtml}}/g, sectionsEnabled.courses !== false ? this.renderTemplate2Courses(data.courses) : '');
      html = html.replace(/{{extracurricularHtml}}/g, sectionsEnabled.extracurricular !== false ? this.renderTemplate2Extracurricular(data.extracurricular) : '');
      
      // Additional simple replacements
      html = html.replace(/{{graduationYear}}/g, data.graduationYear ? '(' + data.graduationYear + ')' : '');

      return html;
    }

    // Handle conditional sections
    html = this.handleConditionalSection(html, 'education', sectionsEnabled.education);
    html = this.handleConditionalSection(html, 'skills', sectionsEnabled.skills && data.skills && data.skills.length > 0);
    html = this.handleConditionalSection(html, 'projects', sectionsEnabled.projects && data.projects && data.projects.length > 0);
    html = this.handleConditionalSection(html, 'internships', sectionsEnabled.internships && data.internships && data.internships.length > 0);
    html = this.handleConditionalSection(html, 'achievements', sectionsEnabled.achievements && data.achievements && data.achievements.length > 0);
    html = this.handleConditionalSection(html, 'publications', sectionsEnabled.publications && data.publications && data.publications.length > 0);
    html = this.handleConditionalSection(html, 'certifications', sectionsEnabled.certifications && data.certifications && data.certifications.length > 0);
    html = this.handleConditionalSection(html, 'positionsOfResponsibility', sectionsEnabled.positionsOfResponsibility && data.positionsOfResponsibility && data.positionsOfResponsibility.length > 0);
    html = this.handleConditionalSection(html, 'courses', sectionsEnabled.courses && data.courses && data.courses.length > 0);
    
    // Handle socialLinks - check both array and object formats
    const hasSocialLinks = Array.isArray(data.socialLinks) 
      ? data.socialLinks.length > 0 
      : (data.socialLinks && Object.values(data.socialLinks).some(v => v));
    html = this.handleConditionalSection(html, 'socialLinks', sectionsEnabled.socialLinks && hasSocialLinks);

    // Handle simple conditionals
    html = html.replace(/{{#if phone}}.*?{{\/if}}/gs, data.phone ? html.match(/{{#if phone}}(.*?){{\/if}}/s)?.[1] || '' : '');
    html = html.replace(/{{#if alternateEmail}}.*?{{\/if}}/gs, data.alternateEmail ? html.match(/{{#if alternateEmail}}(.*?){{\/if}}/s)?.[1] || '' : '');

    // Replace content placeholders
    if (data.skills && data.skills.length > 0) {
      html = html.replace(/{{skillsList}}/g, this.renderSkillsTags(data.skills));
      html = html.replace(/{{skillsText}}/g, this.renderSkillsText(data.skills));
    }

    if (data.projects && data.projects.length > 0) {
      html = html.replace(/{{projectsList}}/g, this.renderProjects(data.projects, templateName));
    }

    if (data.internships && data.internships.length > 0) {
      html = html.replace(/{{internshipsList}}/g, this.renderInternships(data.internships, templateName));
    }

    if (data.achievements && data.achievements.length > 0) {
      html = html.replace(/{{achievementsList}}/g, this.renderAchievements(data.achievements, templateName));
    }

    if (data.certifications && data.certifications.length > 0) {
      html = html.replace(/{{certificationsList}}/g, this.renderCertifications(data.certifications, templateName));
    }

    if (data.publications && data.publications.length > 0) {
      html = html.replace(/{{publicationsList}}/g, this.renderPublications(data.publications, templateName));
    }

    if (data.positionsOfResponsibility && data.positionsOfResponsibility.length > 0) {
      html = html.replace(/{{porList}}/g, this.renderPOR(data.positionsOfResponsibility, templateName));
    }

    if (data.courses && data.courses.length > 0) {
      html = html.replace(/{{coursesList}}/g, this.renderCourses(data.courses, templateName));
    }

    // Use the hasSocialLinks variable already declared above
    if (hasSocialLinks) {
      html = html.replace(/{{socialLinksList}}/g, this.renderSocialLinks(data.socialLinks, templateName));
      html = html.replace(/{{socialLinksText}}/g, this.renderSocialLinks(data.socialLinks, templateName));
    }

    return html;
  }

  // Handle conditional sections
  handleConditionalSection(html, sectionName, shouldShow) {
    const regex = new RegExp(`{{#if ${sectionName}}}([\\s\\S]*?){{/if}}`, 'g');
    return html.replace(regex, shouldShow ? '$1' : '');
  }

  // Template 2 (LaTeX-inspired) specific rendering methods
  renderTemplate2Education(data) {
    const rows = [];
    
    // Add degree education
    if (data.degree && data.branch) {
      rows.push(`
            <tr>
                <td>${data.degree} in ${data.branch}</td>
                <td>Rajiv Gandhi Institute of Petroleum Technology</td>
                <td>Present</td>
                <td>${data.cpi || 'N/A'}${data.cgpaRemark ? ' (' + data.cgpaRemark + ')' : ''}</td>
            </tr>`);
    }
    
    // Add 12th
    if (data.class12Percentage && data.class12School) {
      rows.push(`
            <tr>
                <td>Class XII</td>
                <td>${data.class12School}</td>
                <td>2020</td>
                <td>${data.class12Percentage}%</td>
            </tr>`);
    }
    
    // Add 10th
    if (data.class10Percentage && data.class10School) {
      rows.push(`
            <tr>
                <td>Class X</td>
                <td>${data.class10School}</td>
                <td>2018</td>
                <td>${data.class10Percentage}%</td>
            </tr>`);
    }
    
    if (rows.length === 0) return '';
    
    return `
    <div class="section-wrapper">
        <div class="section-heading">Education</div>
        <table class="edu-table">
            <thead>
                <tr>
                    <th>Course</th>
                    <th>Institution</th>
                    <th>Year</th>
                    <th>CPI/CGPA/Percentage</th>
                </tr>
            </thead>
            <tbody>${rows.join('')}
            </tbody>
        </table>
    </div>`;
  }

  renderTemplate2Internships(internships) {
    if (!internships || internships.length === 0) return '';
    
    const items = internships.map(internship => {
      const startDate = internship.startDate ? new Date(internship.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
      const endDate = internship.endDate ? new Date(internship.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present';
      const duration = startDate && endDate ? `${startDate} - ${endDate}` : '';
      
      const certIcon = internship.certLink ? `<a href="${internship.certLink}" target="_blank" class="title-icon"><i class="fas fa-link"></i></a>` : '';

      const description = internship.description ? `
        <ul>
            <li>${internship.description}</li>
        </ul>` : '';
      
      const bullets = internship.bullets && internship.bullets.length > 0 ? `
        <ul>
            ${internship.bullets.map(bullet => `<li>${bullet}</li>`).join('\n            ')}
        </ul>` : '';
      
      return `
    <div class="item">
        <div class="flex-between">
            <div class="title-group">
                <span class="item-title">${internship.company || ''}</span>
                ${certIcon}
            </div>
            <span class="item-subtitle">${duration}</span>
        </div>
        <div class="flex-between">
            <span class="item-subtitle">${internship.role || ''}</span>
            <span class="item-subtitle" style="font-style: normal;">${internship.location || ''}</span>
        </div>${description}${bullets}
    </div>`;
    }).join('');
    
    return `
    <div class="section-wrapper">
        <div class="section-heading">Experience</div>${items}
    </div>`;
  }

  renderTemplate2Projects(projects) {
    if (!projects || projects.length === 0) return '';
    
    const items = projects.map(project => {
      const startDate = project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
      const endDate = project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present';
      const duration = startDate && endDate ? `${startDate} - ${endDate}` : '';
      
      const githubIcon = project.githubLink ? `<a href="${project.githubLink}" target="_blank" class="title-icon"><i class="fab fa-github"></i></a>` : '';
      const liveIcon = project.liveLink ? `<a href="${project.liveLink}" target="_blank" class="title-icon"><i class="fas fa-external-link-alt"></i></a>` : '';
      
      const supervisor = project.supervisor ? `
        <div class="item-subtitle">Supervisor: ${project.supervisor}</div>` : '';

      const description = project.description ? `
        <div class="item-subtitle">${project.description}</div>` : '';
      
      const bullets = project.bullets && project.bullets.length > 0 ? `
        <ul>
            ${project.bullets.map(bullet => `<li>${bullet}</li>`).join('\n            ')}
        </ul>` : '';
      
      return `
    <div class="item">
        <div class="flex-between">
            <div class="title-group">
                <span class="item-title">${project.title || ''}</span>
                ${githubIcon}
                ${liveIcon}
            </div>
            <span class="item-subtitle">${duration}</span>
        </div>${supervisor}${description}${bullets}
    </div>`;
    }).join('');
    
    return `
    <div class="section-wrapper">
        <div class="section-heading">Projects</div>${items}
    </div>`;
  }

  renderTemplate2Publications(publications) {
    if (!publications || publications.length === 0) return '';
    
    const items = publications.map(pub => {
      const paperIcon = pub.paperLink ? `<a href="${pub.paperLink}" target="_blank" class="title-icon"><i class="fas fa-file-alt"></i></a>` : '';
      
      return `
        <li>
            ${paperIcon}
            <span><strong>${pub.title || ''}</strong> — <em>${pub.journal || ''}</em> (${pub.year || ''})</span>
        </li>`;
    }).join('');
    
    return `
    <div class="section-wrapper">
        <div class="section-heading">Publications</div>
        <ul class="pub-cert-list">${items}
        </ul>
    </div>`;
  }

  renderTemplate2Certifications(certifications) {
    if (!certifications || certifications.length === 0) return '';
    
    const items = certifications.map(cert => {
      const certIcon = cert.certLink ? `<a href="${cert.certLink}" target="_blank" class="title-icon"><i class="fas fa-link"></i></a>` : '';
      
      return `
        <li>
            ${certIcon}
            <span>${cert.name || ''}</span>
        </li>`;
    }).join('');
    
    return `
    <div class="section-wrapper">
        <div class="section-heading">Certifications</div>
        <ul class="pub-cert-list">${items}
        </ul>
    </div>`;
  }

  renderTemplate2Skills(skills) {
    if (!skills || skills.length === 0) return '';
    
    // Group skills by category if they're strings, or use as-is if objects
    let skillRows = '';
    
    if (typeof skills[0] === 'string') {
      // Simple string array - display as single row
      skillRows = `
        <div class="skill-row">
            <span class="skill-category">Skills:</span>
            <span>${skills.join(', ')}</span>
        </div>`;
    } else {
      // Assume categorized skills (future enhancement)
      skillRows = skills.map(skill => `
        <div class="skill-row">
            <span class="skill-category">${skill.category || 'Skills'}:</span>
            <span>${skill.items || skill}</span>
        </div>`).join('');
    }
    
    return `
    <div class="section-wrapper">
        <div class="section-heading">Technical Skills</div>
        <div class="item">${skillRows}
        </div>
    </div>`;
  }

  renderTemplate2Achievements(achievements) {
    if (!achievements || achievements.length === 0) return '';
    
    const items = achievements.map(achievement => `
        <li>${achievement}</li>`).join('');
    
    return `
    <div class="section-wrapper">
        <div class="section-heading">Achievements</div>
        <ul>${items}
        </ul>
    </div>`;
  }

  renderTemplate2POR(positions) {
    if (!positions || positions.length === 0) return '';
    
    const items = positions.map(pos => {
      const startDate = pos.startDate ? new Date(pos.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
      const endDate = pos.endDate ? new Date(pos.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present';
      const duration = startDate && endDate ? `${startDate} - ${endDate}` : '';
      
      const description = pos.description ? `
        <ul>
            <li>${pos.description}</li>
        </ul>` : '';
      
      return `
    <div class="item" style="margin-bottom: 6px;">
        <div class="flex-between">
            <span><strong>${pos.title || ''}:</strong> ${pos.organization || ''}</span>
            <span class="item-subtitle">${duration}</span>
        </div>${description}
    </div>`;
    }).join('');
    
    return `
    <div class="section-wrapper">
        <div class="section-heading">Positions of Responsibility</div>${items}
    </div>`;
  }

  renderTemplate2Courses(courses) {
    if (!courses || courses.length === 0) return '';
    
    const items = courses.map(course => {
      const courseName = typeof course === 'string' ? course : course.name;
      return `
        <li>${courseName}</li>`;
    }).join('');
    
    return `
    <div class="section-wrapper">
        <div class="section-heading">Courses</div>
        <ul>${items}
        </ul>
    </div>`;
  }

  renderTemplate2Extracurricular(extracurricular) {
    if (!extracurricular || extracurricular.length === 0) return '';
    
    const items = extracurricular.map(activity => `
        <li>${activity}</li>`).join('');
    
    return `
    <div class="section-wrapper">
        <div class="section-heading">Extracurricular Activities</div>
        <ul>${items}
        </ul>
    </div>`;
  }

  renderTemplate2SocialLinks(socialLinks) {
    if (!socialLinks) return '';
    
    let links = [];
    
    if (Array.isArray(socialLinks)) {
      links = socialLinks.filter(link => link.displayInHeader !== false);
    } else if (typeof socialLinks === 'object') {
      if (socialLinks.github) links.push({ title: 'GitHub', url: socialLinks.github, icon: 'github' });
      if (socialLinks.linkedin) links.push({ title: 'LinkedIn', url: socialLinks.linkedin, icon: 'linkedin' });
      if (socialLinks.leetcode) links.push({ title: 'LeetCode', url: socialLinks.leetcode, icon: 'leetcode' });
      if (socialLinks.codeforces) links.push({ title: 'Codeforces', url: socialLinks.codeforces, icon: 'codeforces' });
      if (socialLinks.portfolio) links.push({ title: 'Portfolio', url: socialLinks.portfolio, icon: 'portfolio' });
    }
    
    if (links.length === 0) return '';
    
    const linkItems = links.map(link => {
      const icon = iconMap[link.icon] || iconMap.default;
      return `<a href="${link.url}" target="_blank"><i class="${icon}"></i> ${link.title}</a>`;
    }).join('\n        ');
    
    return `
    <div class="profile-links">
        ${linkItems}
    </div>`;
  }

  // Render social links inline for template2 header
  renderTemplate2SocialLinksInline(socialLinks) {
    if (!socialLinks) return '';
    
    let links = [];
    
    if (Array.isArray(socialLinks)) {
      links = socialLinks;
    } else if (typeof socialLinks === 'object') {
      if (socialLinks.github) links.push({ title: 'Github', url: socialLinks.github, icon: 'github' });
      if (socialLinks.linkedin) links.push({ title: 'LinkedIn', url: socialLinks.linkedin, icon: 'linkedin' });
      if (socialLinks.leetcode) links.push({ title: 'LeetCode', url: socialLinks.leetcode, icon: 'leetcode' });
      if (socialLinks.codeforces) links.push({ title: 'Codeforces', url: socialLinks.codeforces, icon: 'codeforces' });
      if (socialLinks.portfolio) links.push({ title: 'Portfolio', url: socialLinks.portfolio, icon: 'portfolio' });
    }
    
    if (links.length === 0) return '';
    
    const linkItems = links.map(link => {
      const icon = iconMap[link.icon] || iconMap.default;
      return `<a href="${link.url}" target="_blank"><i class="${icon}"></i> ${link.title}</a>`;
    }).join('\n            ');
    
    return `
        <div class="social-links-inline">
            ${linkItems}
        </div>`;
  }

  // Load and encode logo for template2
  async getLogoBase64() {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const logoPath = path.join(__dirname, '../rgipt_logo.png');
      const logoBuffer = await fs.readFile(logoPath);
      return logoBuffer.toString('base64');
    } catch (error) {
      console.error('Error loading logo:', error);
      return '';
    }
  }

}

module.exports = new TemplateService();
