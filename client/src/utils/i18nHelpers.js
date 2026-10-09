/**
 * i18nHelpers.js
 * Central presentation-layer translation helpers for RenewTech Workforce
 * Maps backend enum/status values and options to translated display labels
 */

export const getStatusLabel = (status, t) => {
  if (!status) return '';
  const key = String(status).toUpperCase().replace(/[\s-]+/g, '_');
  const translationKey = `status.${key}`;
  const translated = t(translationKey);
  if (translated && translated !== translationKey) {
    return translated;
  }
  // Common mappings
  const map = {
    VERIFIED: t('status.VERIFIED', 'Verified'),
    PENDING: t('status.PENDING', 'Pending'),
    REJECTED: t('status.REJECTED', 'Rejected'),
    APPROVED: t('status.APPROVED', 'Approved'),
    ACTIVE: t('status.ACTIVE', 'Active'),
    COMPLETED: t('status.COMPLETED', 'Completed'),
    AVAILABLE: t('technician.available', 'Available'),
    HIRED: t('status.HIRED', 'Hired'),
    APPLIED: t('status.APPLIED', 'Applied'),
    SHORTLISTED: t('status.SHORTLISTED', 'Shortlisted'),
    ON_PROJECT: t('technician.onProject', 'On Project'),
    UNAVAILABLE: t('technician.unavailable', 'Unavailable'),
    DRAFT: t('status.DRAFT', 'Draft'),
    IN_REVIEW: t('status.IN_REVIEW', 'In Review'),
    WITHDRAWN: t('status.WITHDRAWN', 'Withdrawn'),
    OPEN: t('common.active', 'Open'),
    IN_PROGRESS: t('status.ACTIVE', 'In Progress'),
    ACCEPTED: t('status.APPROVED', 'Accepted'),
    PASS: t('common.approved', 'Passed'),
    PASSED: t('common.approved', 'Passed'),
    FAIL: t('common.rejected', 'Failed'),
    FAILED: t('common.rejected', 'Failed'),
  };
  return map[key] || status;
};

export const getSectorLabel = (sector, t) => {
  if (!sector) return '';
  const s = String(sector).toLowerCase();
  if (s.includes('roof')) return t('sectors.solarRooftop', 'Solar Rooftop');
  if (s.includes('utility') || s.includes('ground')) return t('sectors.utilitySolar', 'Utility-Scale Solar');
  if (s.includes('solar')) return t('landing.solarPVSector', 'Solar PV');
  if (s.includes('wind')) return t('sectors.windEnergy', 'Wind Energy');
  if (s.includes('storage') || s.includes('bess') || s.includes('battery')) return t('sectors.energyStorage', 'Energy Storage & BESS');
  if (s.includes('hydrogen')) return t('sectors.greenHydrogen', 'Green Hydrogen');
  if (s.includes('bio')) return t('sectors.bioenergy', 'Bioenergy');
  if (s.includes('substation') || s.includes('voltage')) return t('sectors.electricalSubstation', 'Electrical Substation');
  return sector;
};

export const getProficiencyLabel = (level, t) => {
  if (!level) return '';
  const l = String(level).toLowerCase();
  if (l.includes('beg')) return t('proficiency.beginner', 'Beginner');
  if (l.includes('inter')) return t('proficiency.intermediate', 'Intermediate');
  if (l.includes('exp')) return t('proficiency.expert', 'Expert');
  if (l.includes('cert')) return t('proficiency.certified', 'Certified');
  return level;
};
