/**
 * Predefined protocol templates used by the Protocol Generator module.
 *
 * These are generic, educational skeleton templates for study design
 * documentation practice. They do NOT constitute medical, regulatory,
 * or clinical guidance and must never be used for real trials.
 */

const TEMPLATES = {
  PHASE_I: {
    label: 'Phase I — First-in-Human Safety Study',
    sections: [
      'Study Title & Background',
      'Primary Objective: Safety & Tolerability',
      'Secondary Objective: Pharmacokinetics',
      'Study Design: Dose-escalation, open-label',
      'Inclusion / Exclusion Criteria',
      'Dosing Schedule & Administration',
      'Safety Monitoring Plan',
      'Statistical Considerations',
      'Ethics & Informed Consent Overview',
    ],
  },
  PHASE_II: {
    label: 'Phase II — Efficacy & Side-Effect Exploration',
    sections: [
      'Study Title & Background',
      'Primary Objective: Preliminary Efficacy',
      'Secondary Objective: Safety Profile Expansion',
      'Study Design: Randomized, controlled',
      'Inclusion / Exclusion Criteria',
      'Sample Size Justification',
      'Endpoints & Assessment Schedule',
      'Adverse Event Monitoring Plan',
      'Statistical Analysis Plan',
      'Data Safety Monitoring Board Overview',
    ],
  },
  PHASE_III: {
    label: 'Phase III — Confirmatory Efficacy Study',
    sections: [
      'Study Title & Background',
      'Primary Objective: Confirmatory Efficacy',
      'Secondary Objectives',
      'Study Design: Multi-center, randomized, double-blind',
      'Inclusion / Exclusion Criteria',
      'Sample Size & Power Justification',
      'Randomization & Blinding Procedures',
      'Efficacy & Safety Endpoints',
      'Statistical Analysis Plan',
      'Regulatory Submission Considerations',
    ],
  },
  PHASE_IV: {
    label: 'Phase IV — Post-Marketing Surveillance',
    sections: [
      'Study Title & Background',
      'Primary Objective: Long-term Safety Surveillance',
      'Study Design: Observational / Registry',
      'Population & Real-World Setting',
      'Data Collection Methods',
      'Adverse Event Reporting Plan',
      'Statistical Considerations',
    ],
  },
  PRECLINICAL: {
    label: 'Preclinical — Research Planning Template',
    sections: [
      'Research Question & Background',
      'Study Objective',
      'Proposed Model / Methodology',
      'Endpoints of Interest',
      'Risk Considerations',
      'Timeline & Milestones',
    ],
  },
};

function getTemplate(phase) {
  return TEMPLATES[phase] || TEMPLATES.PHASE_I;
}

/**
 * Generates a structured protocol document object from form input,
 * merging user-provided content into the chosen phase template.
 */
function generateProtocolDocument(formData) {
  const template = getTemplate(formData.phase);

  const generatedSections = template.sections.map((sectionTitle) => {
    let content = '';
    switch (sectionTitle) {
      case 'Study Title & Background':
      case 'Research Question & Background':
        content = `${formData.title || 'Untitled Study'} — investigating ${formData.condition || 'the specified condition'}.`;
        break;
      case 'Primary Objective: Safety & Tolerability':
      case 'Primary Objective: Preliminary Efficacy':
      case 'Primary Objective: Confirmatory Efficacy':
      case 'Primary Objective: Long-term Safety Surveillance':
      case 'Study Objective':
        content = formData.objective || 'Objective not specified.';
        break;
      case 'Inclusion / Exclusion Criteria':
        content = `Inclusion: ${formData.inclusionCriteria || 'Not specified.'} | Exclusion: ${formData.exclusionCriteria || 'Not specified.'}`;
        break;
      case 'Study Design: Dose-escalation, open-label':
      case 'Study Design: Randomized, controlled':
      case 'Study Design: Multi-center, randomized, double-blind':
      case 'Study Design: Observational / Registry':
      case 'Proposed Model / Methodology':
        content = formData.studyDesign || 'Study design not specified.';
        break;
      default:
        content = `${sectionTitle} — to be completed by the study team.`;
    }
    return { section: sectionTitle, content };
  });

  return {
    templateUsed: template.label,
    phase: formData.phase,
    generatedAt: new Date().toISOString(),
    sections: generatedSections,
    disclaimer:
      'This document was generated from an educational template for coursework/demo purposes only. It is not a validated clinical protocol.',
  };
}

module.exports = { TEMPLATES, getTemplate, generateProtocolDocument };
