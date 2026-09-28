/**
 * ResumeCraft AI – Interactive Frontend Script
 * Multi-step wizard, Dynamic repeaters, Skill chips, Local AI text improvers, Auto-save.
 */

document.addEventListener('DOMContentLoaded', () => {
    initWizard();
    initSkillTags();
    initRepeaterTemplates();
    initActionImprovers();
    initAutoSave();
    updateCompletionIndicator();
});

// Global state tracking
let currentStep = 1;
const totalSteps = 9;

/* ==========================================================================
   1. Multi-Step Form Wizard Navigation
   ========================================================================== */
function initWizard() {
    const nextBtns = document.querySelectorAll('.btn-next-step');
    const prevBtns = document.querySelectorAll('.btn-prev-step');
    const stepItems = document.querySelectorAll('.step-item');

    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateCurrentStep(currentStep)) {
                if (currentStep < totalSteps) {
                    goToStep(currentStep + 1);
                }
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 1) {
                goToStep(currentStep - 1);
            }
        });
    });

    stepItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetStep = parseInt(item.getAttribute('data-step'));
            if (targetStep && targetStep !== currentStep) {
                goToStep(targetStep);
            }
        });
    });
}

function goToStep(stepNumber) {
    // Hide all step panes
    document.querySelectorAll('.step-pane').forEach(pane => {
        pane.style.display = 'none';
    });

    // Show target step pane
    const targetPane = document.getElementById(`step-pane-${stepNumber}`);
    if (targetPane) {
        targetPane.style.display = 'block';
    }

    // Update stepper circles & labels
    document.querySelectorAll('.step-item').forEach(item => {
        const itemStep = parseInt(item.getAttribute('data-step'));
        item.classList.remove('active', 'completed');
        if (itemStep === stepNumber) {
            item.classList.add('active');
        } else if (itemStep < stepNumber) {
            item.classList.add('completed');
        }
    });

    currentStep = stepNumber;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateCompletionIndicator();
}

function validateCurrentStep(step) {
    if (step === 1) {
        const nameInput = document.getElementById('full_name');
        if (nameInput && !nameInput.value.trim()) {
            showToast('Please enter your full name before continuing.', 'warning');
            nameInput.focus();
            return false;
        }
    }
    return true;
}

/* ==========================================================================
   2. Skill Tags / Chips Manager
   ========================================================================== */
function initSkillTags() {
    ['technical', 'soft', 'tools'].forEach(type => {
        const input = document.getElementById(`input-${type}-skill`);
        const container = document.getElementById(`container-${type}-skills`);

        if (input && container) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const val = input.value.trim().replace(/,$/, '');
                    if (val) {
                        addSkillChip(type, val);
                        input.value = '';
                    }
                }
            });
        }
    });

    // Quick suggestion buttons
    document.querySelectorAll('.chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const skillName = btn.getAttribute('data-skill');
            const targetType = btn.getAttribute('data-target') || 'technical';
            addSkillChip(targetType, skillName);
            btn.style.opacity = '0.5';
            btn.disabled = true;
        });
    });
}

function addSkillChip(type, name) {
    const container = document.getElementById(`container-${type}-skills`);
    const input = document.getElementById(`input-${type}-skill`);
    if (!container || !input) return;

    // Check duplicate
    const existing = Array.from(container.querySelectorAll('.tag-chip')).map(c => c.getAttribute('data-value').toLowerCase());
    if (existing.includes(name.toLowerCase())) return;

    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.setAttribute('data-value', name);
    chip.innerHTML = `${escapeHtml(name)} <span class="tag-chip-remove" onclick="removeSkillChip(this)">&times;</span>`;

    container.insertBefore(chip, input);
    updateCompletionIndicator();
}

function removeSkillChip(elem) {
    const chip = elem.closest('.tag-chip');
    if (chip) {
        chip.remove();
        updateCompletionIndicator();
    }
}

function getSkillsArray(type) {
    const container = document.getElementById(`container-${type}-skills`);
    if (!container) return [];
    return Array.from(container.querySelectorAll('.tag-chip')).map(c => c.getAttribute('data-value'));
}

/* ==========================================================================
   3. Dynamic Repeaters (Education, Experience, Internships, Projects, Certs, etc.)
   ========================================================================== */
function initRepeaterTemplates() {
    // Current Job toggle helpers
    document.addEventListener('change', (e) => {
        if (e.target.matches('.is-current-checkbox')) {
            const row = e.target.closest('.repeater-card');
            const endInput = row.querySelector('.end-date-input');
            if (endInput) {
                endInput.disabled = e.target.checked;
                if (e.target.checked) endInput.value = '';
            }
        }
    });
}

function addEducationEntry(data = {}) {
    const container = document.getElementById('education-list');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'repeater-card education-item';
    div.innerHTML = `
        <div class="repeater-header">
            <span class="repeater-title">🎓 Education Degree</span>
            <button type="button" class="repeater-remove" onclick="this.closest('.repeater-card').remove(); updateCompletionIndicator();">
                🗑️ Remove
            </button>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Degree / Program *</label>
                <input type="text" class="form-control edu-degree" placeholder="e.g. Bachelor of Technology" value="${escapeHtml(data.degree || '')}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Branch / Field of Study</label>
                <input type="text" class="form-control edu-field" placeholder="e.g. Computer Science & AI" value="${escapeHtml(data.field || '')}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">College / University Name *</label>
                <input type="text" class="form-control edu-institution" placeholder="e.g. National Institute of Technology" value="${escapeHtml(data.institution || '')}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Location</label>
                <input type="text" class="form-control edu-location" placeholder="e.g. Bengaluru, India" value="${escapeHtml(data.location || '')}">
            </div>
        </div>
        <div class="form-row-3">
            <div class="form-group">
                <label class="form-label">Start Year</label>
                <input type="text" class="form-control edu-start" placeholder="e.g. 2021" value="${escapeHtml(data.start_year || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">Graduation Year</label>
                <input type="text" class="form-control edu-end" placeholder="e.g. 2025" value="${escapeHtml(data.end_year || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">CGPA / Percentage</label>
                <input type="text" class="form-control edu-grade" placeholder="e.g. 8.8 / 10 CGPA" value="${escapeHtml(data.grade || '')}">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">Relevant Coursework <span class="optional">(Optional)</span></label>
            <input type="text" class="form-control edu-coursework" placeholder="e.g. Data Structures, Operating Systems, Machine Learning" value="${escapeHtml(data.coursework || '')}">
        </div>
        <div class="form-group">
            <label class="form-label">Academic Honors / Achievements <span class="optional">(Optional)</span></label>
            <input type="text" class="form-control edu-achievements" placeholder="e.g. Dean's Merit List, Top 5% in Department" value="${escapeHtml(data.achievements || '')}">
        </div>
    `;
    container.appendChild(div);
    updateCompletionIndicator();
}

function addExperienceEntry(data = {}) {
    const container = document.getElementById('experience-list');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'repeater-card experience-item';
    div.innerHTML = `
        <div class="repeater-header">
            <span class="repeater-title">💼 Work Experience Entry</span>
            <button type="button" class="repeater-remove" onclick="this.closest('.repeater-card').remove(); updateCompletionIndicator();">
                🗑️ Remove
            </button>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Job Title *</label>
                <input type="text" class="form-control exp-title" placeholder="e.g. Software Engineer" value="${escapeHtml(data.title || data.role || '')}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Company / Organization *</label>
                <input type="text" class="form-control exp-company" placeholder="e.g. Infosys / Google" value="${escapeHtml(data.company || '')}" required>
            </div>
        </div>
        <div class="form-row-3">
            <div class="form-group">
                <label class="form-label">Location</label>
                <input type="text" class="form-control exp-location" placeholder="e.g. Hyderabad, India" value="${escapeHtml(data.location || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">Start Date</label>
                <input type="text" class="form-control exp-start" placeholder="e.g. Jan 2023" value="${escapeHtml(data.start_date || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">End Date</label>
                <input type="text" class="form-control exp-end end-date-input" placeholder="e.g. Present" value="${escapeHtml(data.end_date || '')}" ${data.is_current ? 'disabled' : ''}>
                <div style="margin-top:4px;">
                    <label style="font-size:0.8rem; cursor:pointer;"><input type="checkbox" class="is-current-checkbox" ${data.is_current ? 'checked' : ''}> Current Job</label>
                </div>
            </div>
        </div>
        <div class="form-group">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <label class="form-label" style="margin-bottom:0;">Key Responsibilities & Bullet Points</label>
                <button type="button" class="btn btn-sm btn-secondary" onclick="improveBulletInElement(this.closest('.repeater-card').querySelector('.exp-resp'))">
                    ✨ Improve Bullet Points
                </button>
            </div>
            <textarea class="form-control exp-resp" placeholder="• Developed automated data ingestion pipelines using Python and SQL.&#10;• Reduced processing time by 40% through query optimization.">${escapeHtml(data.responsibilities || '')}</textarea>
            <div class="form-hint">Tip: Use strong action verbs (e.g., Developed, Engineered, Optimized) and include metrics where genuine.</div>
        </div>
        <div class="form-group">
            <label class="form-label">Key Achievement <span class="optional">(Optional)</span></label>
            <input type="text" class="form-control exp-ach" placeholder="e.g. Awarded Employee of the Quarter" value="${escapeHtml(data.achievements || '')}">
        </div>
    `;
    container.appendChild(div);
    updateCompletionIndicator();
}

function addInternshipEntry(data = {}) {
    const container = document.getElementById('internship-list');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'repeater-card internship-item';
    div.innerHTML = `
        <div class="repeater-header">
            <span class="repeater-title">🌱 Internship Entry</span>
            <button type="button" class="repeater-remove" onclick="this.closest('.repeater-card').remove(); updateCompletionIndicator();">
                🗑️ Remove
            </button>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Internship Role *</label>
                <input type="text" class="form-control intern-role" placeholder="e.g. Full-Stack Developer Intern" value="${escapeHtml(data.role || '')}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Company / Organization *</label>
                <input type="text" class="form-control intern-company" placeholder="e.g. Startup Hub" value="${escapeHtml(data.company || '')}" required>
            </div>
        </div>
        <div class="form-row-3">
            <div class="form-group">
                <label class="form-label">Location</label>
                <input type="text" class="form-control intern-location" placeholder="e.g. Bengaluru / Remote" value="${escapeHtml(data.location || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">Start Date</label>
                <input type="text" class="form-control intern-start" placeholder="e.g. May 2024" value="${escapeHtml(data.start_date || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">End Date</label>
                <input type="text" class="form-control intern-end" placeholder="e.g. Jul 2024" value="${escapeHtml(data.end_date || '')}">
            </div>
        </div>
        <div class="form-group">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <label class="form-label" style="margin-bottom:0;">Responsibilities & Contributions</label>
                <button type="button" class="btn btn-sm btn-secondary" onclick="improveBulletInElement(this.closest('.repeater-card').querySelector('.intern-resp'))">
                    ✨ Improve Wording
                </button>
            </div>
            <textarea class="form-control intern-resp" placeholder="• Built RESTful endpoints using Flask and SQLite.&#10;• Collaborated with team members during bi-weekly sprints.">${escapeHtml(data.responsibilities || '')}</textarea>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Skills / Technologies Used</label>
                <input type="text" class="form-control intern-skills" placeholder="e.g. Python, Flask, Git, Docker" value="${escapeHtml(data.skills_used || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">Internship Achievement <span class="optional">(Optional)</span></label>
                <input type="text" class="form-control intern-ach" placeholder="e.g. Best intern performance award" value="${escapeHtml(data.achievements || '')}">
            </div>
        </div>
    `;
    container.appendChild(div);
    updateCompletionIndicator();
}

function addProjectEntry(data = {}) {
    const container = document.getElementById('project-list');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'repeater-card project-item';
    div.innerHTML = `
        <div class="repeater-header">
            <span class="repeater-title">🚀 Project Entry</span>
            <button type="button" class="repeater-remove" onclick="this.closest('.repeater-card').remove(); updateCompletionIndicator();">
                🗑️ Remove
            </button>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Project Title *</label>
                <input type="text" class="form-control proj-title" placeholder="e.g. ResumeCraft AI Resume Maker" value="${escapeHtml(data.title || '')}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Technologies Used *</label>
                <input type="text" class="form-control proj-tech" placeholder="e.g. Python, Flask, SQLite, ReportLab, HTML/CSS" value="${escapeHtml(data.technologies || '')}">
            </div>
        </div>
        <div class="form-group">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <label class="form-label" style="margin-bottom:0;">Project Description / Overview</label>
                <button type="button" class="btn btn-sm btn-secondary" onclick="improveProjectInElement(this.closest('.repeater-card'))">
                    ✨ Improve Description
                </button>
            </div>
            <textarea class="form-control proj-desc" placeholder="Developed a local-first resume builder and ATS compatibility scoring application with ReportLab PDF rendering.">${escapeHtml(data.description || '')}</textarea>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Key Features / Implementation Details</label>
                <input type="text" class="form-control proj-features" placeholder="e.g. Multi-step form, 100-point rule-based ATS evaluation, 3 PDF templates" value="${escapeHtml(data.features || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">Results / Impact / Metrics <span class="optional">(Optional)</span></label>
                <input type="text" class="form-control proj-results" placeholder="e.g. Generated resumes in < 0.5s with zero external API dependencies" value="${escapeHtml(data.results || '')}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">GitHub Repository URL <span class="optional">(Optional)</span></label>
                <input type="url" class="form-control proj-github" placeholder="https://github.com/username/project" value="${escapeHtml(data.github_url || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">Live Demo URL <span class="optional">(Optional)</span></label>
                <input type="url" class="form-control proj-live" placeholder="https://projectdemo.com" value="${escapeHtml(data.live_url || '')}">
            </div>
        </div>
    `;
    container.appendChild(div);
    updateCompletionIndicator();
}

function addCertificationEntry(data = {}) {
    const container = document.getElementById('cert-list');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'repeater-card cert-item';
    div.innerHTML = `
        <div class="repeater-header">
            <span class="repeater-title">📜 Certification</span>
            <button type="button" class="repeater-remove" onclick="this.closest('.repeater-card').remove(); updateCompletionIndicator();">
                🗑️ Remove
            </button>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Certification Name *</label>
                <input type="text" class="form-control cert-name" placeholder="e.g. AWS Certified Cloud Practitioner" value="${escapeHtml(data.name || '')}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Issuing Organization *</label>
                <input type="text" class="form-control cert-issuer" placeholder="e.g. Amazon Web Services / Coursera" value="${escapeHtml(data.issuer || '')}">
            </div>
        </div>
        <div class="form-row-3">
            <div class="form-group">
                <label class="form-label">Date Earned</label>
                <input type="text" class="form-control cert-date" placeholder="e.g. Aug 2024" value="${escapeHtml(data.date || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">Credential ID</label>
                <input type="text" class="form-control cert-id" placeholder="e.g. AWS-123456" value="${escapeHtml(data.credential_id || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">Verification URL</label>
                <input type="url" class="form-control cert-url" placeholder="https://..." value="${escapeHtml(data.credential_url || '')}">
            </div>
        </div>
    `;
    container.appendChild(div);
    updateCompletionIndicator();
}

function addAchievementEntry(data = {}) {
    const container = document.getElementById('ach-list');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'repeater-card ach-item';
    div.innerHTML = `
        <div class="repeater-header">
            <span class="repeater-title">🏆 Honor / Achievement</span>
            <button type="button" class="repeater-remove" onclick="this.closest('.repeater-card').remove(); updateCompletionIndicator();">
                🗑️ Remove
            </button>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Achievement Title *</label>
                <input type="text" class="form-control ach-title" placeholder="e.g. 1st Place - Smart India Hackathon" value="${escapeHtml(data.title || '')}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Category</label>
                <input type="text" class="form-control ach-cat" placeholder="e.g. Hackathon / Academic Award" value="${escapeHtml(data.category || '')}">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">Brief Description</label>
            <input type="text" class="form-control ach-desc" placeholder="e.g. Developed an offline emergency coordination system among 100+ participating teams." value="${escapeHtml(data.description || '')}">
        </div>
    `;
    container.appendChild(div);
    updateCompletionIndicator();
}

function addLanguageEntry(data = {}) {
    const container = document.getElementById('lang-list');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'repeater-card lang-item';
    div.innerHTML = `
        <div class="repeater-header">
            <span class="repeater-title">🌐 Language</span>
            <button type="button" class="repeater-remove" onclick="this.closest('.repeater-card').remove(); updateCompletionIndicator();">
                🗑️ Remove
            </button>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Language Name</label>
                <input type="text" class="form-control lang-name" placeholder="e.g. English" value="${escapeHtml(data.language || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">Proficiency</label>
                <select class="form-control lang-prof">
                    <option value="Fluent" ${data.proficiency === 'Fluent' ? 'selected' : ''}>Fluent</option>
                    <option value="Native" ${data.proficiency === 'Native' ? 'selected' : ''}>Native</option>
                    <option value="Advanced" ${data.proficiency === 'Advanced' ? 'selected' : ''}>Advanced</option>
                    <option value="Intermediate" ${data.proficiency === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                    <option value="Beginner" ${data.proficiency === 'Beginner' ? 'selected' : ''}>Beginner</option>
                </select>
            </div>
        </div>
    `;
    container.appendChild(div);
}

/* ==========================================================================
   4. Local AI Deterministic Enhancers & Writing Assistance
   ========================================================================== */
function initActionImprovers() {
    const btnSummaryAI = document.getElementById('btn-generate-summary');
    if (btnSummaryAI) {
        btnSummaryAI.addEventListener('click', async () => {
            const resumeData = collectFormData();
            btnSummaryAI.disabled = true;
            btnSummaryAI.innerText = '⚡ Generating...';

            try {
                const res = await fetch('/api/improve-summary', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: resumeData })
                });
                const result = await res.json();
                if (result.success && result.summary) {
                    const summaryArea = document.getElementById('summary_text');
                    if (summaryArea) {
                        summaryArea.value = result.summary;
                        showToast('Professional summary synthesized from your truthful profile!', 'success');
                    }
                }
            } catch (err) {
                showToast('Could not generate summary.', 'warning');
            } finally {
                btnSummaryAI.disabled = false;
                btnSummaryAI.innerText = '✨ Generate Professional Summary';
                updateCompletionIndicator();
            }
        });
    }
}

async function improveBulletInElement(textarea) {
    if (!textarea) return;
    const text = textarea.value.trim();
    if (!text) {
        showToast('Please enter some text or bullet points first.', 'info');
        return;
    }

    try {
        const res = await fetch('/api/improve-bullet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });
        const result = await res.json();
        if (result.success && result.improved) {
            textarea.value = result.improved;
            showToast('Enhanced bullet wording with strong action verbs!', 'success');
        }
    } catch (e) {
        showToast('Error enhancing text.', 'danger');
    }
}

async function improveProjectInElement(cardElem) {
    const title = cardElem.querySelector('.proj-title')?.value || '';
    const desc = cardElem.querySelector('.proj-desc')?.value || '';
    const tech = cardElem.querySelector('.proj-tech')?.value || '';

    try {
        const res = await fetch('/api/improve-project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description: desc, technologies: tech })
        });
        const result = await res.json();
        if (result.success && result.improved) {
            cardElem.querySelector('.proj-desc').value = result.improved;
            showToast('Project description improved professionally!', 'success');
        }
    } catch (e) {
        showToast('Error improving project description.', 'danger');
    }
}

/* ==========================================================================
   5. Form Data Serialization & Auto-Save
   ========================================================================== */
function collectFormData() {
    const personal = {
        full_name: document.getElementById('full_name')?.value.trim() || '',
        job_title: document.getElementById('job_title')?.value.trim() || '',
        email: document.getElementById('email')?.value.trim() || '',
        phone: document.getElementById('phone')?.value.trim() || '',
        city: document.getElementById('city')?.value.trim() || '',
        state: document.getElementById('state')?.value.trim() || '',
        country: document.getElementById('country')?.value.trim() || '',
        linkedin: document.getElementById('linkedin')?.value.trim() || '',
        github: document.getElementById('github')?.value.trim() || '',
        portfolio: document.getElementById('portfolio')?.value.trim() || '',
        website: document.getElementById('website')?.value.trim() || ''
    };

    const summary = {
        text: document.getElementById('summary_text')?.value.trim() || '',
        target_role: document.getElementById('target_role')?.value.trim() || '',
        years_experience: document.getElementById('years_experience')?.value.trim() || '',
        strengths: document.getElementById('strengths')?.value.trim() || ''
    };

    // Education
    const education = [];
    document.querySelectorAll('.education-item').forEach(card => {
        const degree = card.querySelector('.edu-degree')?.value.trim() || '';
        const institution = card.querySelector('.edu-institution')?.value.trim() || '';
        if (degree || institution) {
            education.push({
                degree: degree,
                field: card.querySelector('.edu-field')?.value.trim() || '',
                institution: institution,
                location: card.querySelector('.edu-location')?.value.trim() || '',
                start_year: card.querySelector('.edu-start')?.value.trim() || '',
                end_year: card.querySelector('.edu-end')?.value.trim() || '',
                grade: card.querySelector('.edu-grade')?.value.trim() || '',
                coursework: card.querySelector('.edu-coursework')?.value.trim() || '',
                achievements: card.querySelector('.edu-achievements')?.value.trim() || ''
            });
        }
    });

    // Experience
    const experience = [];
    document.querySelectorAll('.experience-item').forEach(card => {
        const title = card.querySelector('.exp-title')?.value.trim() || '';
        const company = card.querySelector('.exp-company')?.value.trim() || '';
        if (title || company) {
            experience.push({
                title: title,
                company: company,
                location: card.querySelector('.exp-location')?.value.trim() || '',
                start_date: card.querySelector('.exp-start')?.value.trim() || '',
                end_date: card.querySelector('.exp-end')?.value.trim() || '',
                is_current: card.querySelector('.is-current-checkbox')?.checked || false,
                responsibilities: card.querySelector('.exp-resp')?.value.trim() || '',
                achievements: card.querySelector('.exp-ach')?.value.trim() || ''
            });
        }
    });

    // Internships
    const internships = [];
    document.querySelectorAll('.internship-item').forEach(card => {
        const role = card.querySelector('.intern-role')?.value.trim() || '';
        const company = card.querySelector('.intern-company')?.value.trim() || '';
        if (role || company) {
            internships.push({
                role: role,
                company: company,
                location: card.querySelector('.intern-location')?.value.trim() || '',
                start_date: card.querySelector('.intern-start')?.value.trim() || '',
                end_date: card.querySelector('.intern-end')?.value.trim() || '',
                responsibilities: card.querySelector('.intern-resp')?.value.trim() || '',
                skills_used: card.querySelector('.intern-skills')?.value.trim() || '',
                achievements: card.querySelector('.intern-ach')?.value.trim() || ''
            });
        }
    });

    // Skills
    const skills = {
        technical: getSkillsArray('technical'),
        soft: getSkillsArray('soft'),
        tools: getSkillsArray('tools')
    };

    // Projects
    const projects = [];
    document.querySelectorAll('.project-item').forEach(card => {
        const title = card.querySelector('.proj-title')?.value.trim() || '';
        if (title) {
            projects.push({
                title: title,
                technologies: card.querySelector('.proj-tech')?.value.trim() || '',
                description: card.querySelector('.proj-desc')?.value.trim() || '',
                features: card.querySelector('.proj-features')?.value.trim() || '',
                results: card.querySelector('.proj-results')?.value.trim() || '',
                github_url: card.querySelector('.proj-github')?.value.trim() || '',
                live_url: card.querySelector('.proj-live')?.value.trim() || ''
            });
        }
    });

    // Certifications
    const certifications = [];
    document.querySelectorAll('.cert-item').forEach(card => {
        const name = card.querySelector('.cert-name')?.value.trim() || '';
        if (name) {
            certifications.push({
                name: name,
                issuer: card.querySelector('.cert-issuer')?.value.trim() || '',
                date: card.querySelector('.cert-date')?.value.trim() || '',
                credential_id: card.querySelector('.cert-id')?.value.trim() || '',
                credential_url: card.querySelector('.cert-url')?.value.trim() || ''
            });
        }
    });

    // Achievements
    const achievements = [];
    document.querySelectorAll('.ach-item').forEach(card => {
        const title = card.querySelector('.ach-title')?.value.trim() || '';
        if (title) {
            achievements.push({
                title: title,
                category: card.querySelector('.ach-cat')?.value.trim() || '',
                description: card.querySelector('.ach-desc')?.value.trim() || ''
            });
        }
    });

    // Languages
    const languages = [];
    document.querySelectorAll('.lang-item').forEach(card => {
        const lang = card.querySelector('.lang-name')?.value.trim() || '';
        if (lang) {
            languages.push({
                language: lang,
                proficiency: card.querySelector('.lang-prof')?.value || 'Fluent'
            });
        }
    });

    // Interests
    const interests = (document.getElementById('interests_text')?.value.trim() || '')
        .split(',')
        .map(s => s.strip ? s.strip() : s.trim())
        .filter(Boolean);

    return {
        personal,
        summary,
        education,
        experience,
        internships,
        skills,
        projects,
        certifications,
        achievements,
        languages,
        interests
    };
}

function initAutoSave() {
    const saveBtn = document.getElementById('btn-save-resume');
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            await saveResumeToServer(false);
        });
    }

    const loadDemoBtn = document.getElementById('btn-load-demo');
    if (loadDemoBtn) {
        loadDemoBtn.addEventListener('click', async () => {
            if (confirm('Load sample student/fresher resume data to test immediately?')) {
                await loadDemoData();
            }
        });
    }

    // Input listeners to trigger completion calculation
    document.addEventListener('input', debounce(() => {
        updateCompletionIndicator();
    }, 400));
}

async function saveResumeToServer(silent = false) {
    const data = collectFormData();
    const resumeIdInput = document.getElementById('resume_id');
    const resumeId = resumeIdInput ? resumeIdInput.value : null;
    const templateName = document.getElementById('selected_template')?.value || 'modern';

    try {
        const res = await fetch('/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                resume_id: resumeId,
                data: data,
                template_name: templateName
            })
        });
        const result = await res.json();
        if (result.success) {
            if (resumeIdInput && result.resume_id) {
                resumeIdInput.value = result.resume_id;
            }
            if (!silent) {
                showToast('Resume saved successfully!', 'success');
            }
            return result;
        } else {
            if (!silent) showToast(result.error || 'Failed to save', 'danger');
        }
    } catch (e) {
        if (!silent) showToast('Network error while saving.', 'danger');
    }
    return null;
}

async function loadDemoData() {
    try {
        const res = await fetch('/api/load-demo');
        const result = await res.json();
        if (result.success && result.data) {
            populateFormWithData(result.data);
            showToast('Sample resume data loaded! You can edit, customize, or generate PDF.', 'success');
        }
    } catch (e) {
        showToast('Error loading sample data.', 'danger');
    }
}

function populateFormWithData(data) {
    // 1. Personal
    const p = data.personal || {};
    if (document.getElementById('full_name')) document.getElementById('full_name').value = p.full_name || '';
    if (document.getElementById('job_title')) document.getElementById('job_title').value = p.job_title || '';
    if (document.getElementById('email')) document.getElementById('email').value = p.email || '';
    if (document.getElementById('phone')) document.getElementById('phone').value = p.phone || '';
    if (document.getElementById('city')) document.getElementById('city').value = p.city || '';
    if (document.getElementById('state')) document.getElementById('state').value = p.state || '';
    if (document.getElementById('country')) document.getElementById('country').value = p.country || '';
    if (document.getElementById('linkedin')) document.getElementById('linkedin').value = p.linkedin || '';
    if (document.getElementById('github')) document.getElementById('github').value = p.github || '';
    if (document.getElementById('portfolio')) document.getElementById('portfolio').value = p.portfolio || '';

    // 2. Summary
    const s = data.summary || {};
    if (document.getElementById('summary_text')) document.getElementById('summary_text').value = s.text || '';
    if (document.getElementById('target_role')) document.getElementById('target_role').value = s.target_role || '';
    if (document.getElementById('years_experience')) document.getElementById('years_experience').value = s.years_experience || '';
    if (document.getElementById('strengths')) document.getElementById('strengths').value = s.strengths || '';

    // 3. Education
    const eduList = document.getElementById('education-list');
    if (eduList) {
        eduList.innerHTML = '';
        (data.education || []).forEach(edu => addEducationEntry(edu));
    }

    // 4. Experience
    const expList = document.getElementById('experience-list');
    if (expList) {
        expList.innerHTML = '';
        (data.experience || []).forEach(exp => addExperienceEntry(exp));
    }

    // 5. Internships
    const internList = document.getElementById('internship-list');
    if (internList) {
        internList.innerHTML = '';
        (data.internships || []).forEach(intern => addInternshipEntry(intern));
    }

    // 6. Skills
    ['technical', 'soft', 'tools'].forEach(type => {
        const container = document.getElementById(`container-${type}-skills`);
        if (container) {
            container.querySelectorAll('.tag-chip').forEach(c => c.remove());
            ((data.skills && data.skills[type]) || []).forEach(sk => addSkillChip(type, sk));
        }
    });

    // 7. Projects
    const projList = document.getElementById('project-list');
    if (projList) {
        projList.innerHTML = '';
        (data.projects || []).forEach(proj => addProjectEntry(proj));
    }

    // 8. Certifications
    const certList = document.getElementById('cert-list');
    if (certList) {
        certList.innerHTML = '';
        (data.certifications || []).forEach(cert => addCertificationEntry(cert));
    }

    // 9. Achievements
    const achList = document.getElementById('ach-list');
    if (achList) {
        achList.innerHTML = '';
        (data.achievements || []).forEach(ach => addAchievementEntry(ach));
    }

    // Languages
    const langList = document.getElementById('lang-list');
    if (langList) {
        langList.innerHTML = '';
        (data.languages || []).forEach(lang => addLanguageEntry(lang));
    }

    // Interests
    if (document.getElementById('interests_text')) {
        document.getElementById('interests_text').value = (data.interests || []).join(', ');
    }

    updateCompletionIndicator();
}

/* ==========================================================================
   6. Live Completion Indicator
   ========================================================================== */
function updateCompletionIndicator() {
    const data = collectFormData();
    let score = 0;

    if (data.personal.full_name) score += 10;
    if (data.personal.email && data.personal.phone) score += 10;
    if (data.summary.text && data.summary.text.length > 20) score += 15;
    if (data.education.length > 0) score += 20;
    if (data.skills.technical.length >= 3) score += 15;
    if (data.experience.length > 0 || data.internships.length > 0) score += 15;
    if (data.projects.length > 0) score += 10;
    if (data.certifications.length > 0 || data.achievements.length > 0) score += 5;

    score = Math.min(100, score);

    const barFill = document.getElementById('completion-bar-fill');
    const badgeTxt = document.getElementById('completion-pct-text');
    if (barFill) barFill.style.width = `${score}%`;
    if (badgeTxt) badgeTxt.innerText = `${score}%`;
}

/* ==========================================================================
   7. UI Helpers & Toasts
   ========================================================================== */
function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast-banner');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `alert alert-${type} toast-banner`;
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.zIndex = '9999';
    toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
    toast.style.maxWidth = '400px';
    toast.innerHTML = `<span>${escapeHtml(message)}</span> <button type="button" style="background:none;border:none;cursor:pointer;font-weight:bold;margin-left:12px;" onclick="this.parentElement.remove();">&times;</button>`;

    document.body.appendChild(toast);
    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, 4500);
}

function escapeHtml(text) {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
