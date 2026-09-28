/**
 * RenewTech Workforce - Smart Multi-Factor AI & Rule-Based Matching Engine
 * 
 * Formula (100% Total Normalized Weight):
 * - Technical Skills Overlap:       35%
 * - Verified Certifications:        20%
 * - Field Project Experience:        15%
 * - Geographic Proximity & Travel:  10%
 * - Mobilization Availability:      10%
 * - Competency Assessment Score:     5%
 * - Verified Contractor Rating:      5%
 * 
 * Generates transparent factor scores, matched/missing skill inventories,
 * strengths vs. gaps analysis, and executive match narratives.
 */

const Certificate = require('../models/Certificate');
const AssessmentResult = require('../models/AssessmentResult');

/**
 * Calculates a multi-factor match score between a Project and a Technician.
 * 
 * @param {Object} project - Project document
 * @param {Object} technicianUser - Technician User document
 * @param {Object} technicianProfile - TechnicianProfile document
 * @param {Array}  [certificates=null] - Optional pre-loaded Certificate documents
 * @param {Array}  [assessmentResults=null] - Optional pre-loaded AssessmentResult documents
 * @returns {Object} { matchScore, breakdown }
 */
async function calculateMatchScore(
  project,
  technicianUser,
  technicianProfile,
  certificates = null,
  assessmentResults = null
) {
  const userId = technicianUser?._id || technicianProfile?.user;

  // 0. Lazy load dependencies if not passed in
  if (!certificates && userId) {
    certificates = await Certificate.find({ technician: userId });
  } else if (!certificates) {
    certificates = [];
  }

  if (!assessmentResults && userId) {
    assessmentResults = await AssessmentResult.find({ technician: userId });
  } else if (!assessmentResults) {
    assessmentResults = [];
  }

  const strengths = [];
  const gapAnalysis = [];
  const reasons = [];

  // ==========================================
  // 1. SKILL ALIGNMENT (35% Weight)
  // ==========================================
  const requiredSkills = project.requiredSkills || [];
  const techSkills = technicianProfile?.renewableSkills || [];
  
  let skillMatch = 0;
  const matchedSkills = [];
  const missingSkills = [];

  if (requiredSkills.length === 0) {
    skillMatch = 85;
    strengths.push('Compatible with general renewable project requirements');
  } else {
    let totalSkillWeight = 0;

    requiredSkills.forEach((reqSkill) => {
      const cleanReq = reqSkill.toLowerCase().trim();
      const found = techSkills.find((ts) => {
        const skillName = typeof ts === 'object' && ts !== null ? (ts.name || '') : String(ts || '');
        const cleanTs = skillName.toLowerCase().trim();
        return (
          cleanTs === cleanReq ||
          cleanTs.includes(cleanReq) ||
          cleanReq.includes(cleanTs)
        );
      });

      if (found) {
        const nameVal = typeof found === 'object' && found !== null ? (found.name || reqSkill) : String(found);
        const proficiencyVal = (typeof found === 'object' && found?.proficiency) || 'Intermediate';
        const isVerifiedVal = !!(typeof found === 'object' && found?.isVerified);

        matchedSkills.push({
          name: nameVal,
          proficiency: proficiencyVal,
          isVerified: isVerifiedVal,
          matchedRequirement: reqSkill,
        });

        // Proficiency multiplier
        let weight = 0.75;
        if (proficiencyVal === 'Expert') weight = 1.0;
        else if (proficiencyVal === 'Advanced') weight = 0.90;
        else if (proficiencyVal === 'Intermediate') weight = 0.75;
        else if (proficiencyVal === 'Beginner') weight = 0.50;

        // Verified skill bonus
        if (isVerifiedVal) {
          weight = Math.min(1.0, weight + 0.1);
        }

        totalSkillWeight += weight;
      } else {
        missingSkills.push(reqSkill);
      }
    });

    skillMatch = Math.min(100, Math.round((totalSkillWeight / requiredSkills.length) * 100));
  }

  if (matchedSkills.length > 0) {
    const verifiedCount = matchedSkills.filter((s) => s.isVerified).length;
    strengths.push(
      `${matchedSkills.length} of ${requiredSkills.length || matchedSkills.length} required skills matched (${verifiedCount} verified)`
    );
    reasons.push(
      `✓ ${skillMatch}% skill compatibility: ${matchedSkills.map((s) => s.name).slice(0, 3).join(', ')}`
    );
  } else {
    gapAnalysis.push('Lacks direct overlap with primary project skill requirements');
    reasons.push('ℹ Emerging renewable background; cross-skilling recommended');
  }

  if (missingSkills.length > 0) {
    gapAnalysis.push(`Missing specific skills: ${missingSkills.slice(0, 3).join(', ')}`);
  }

  // ==========================================
  // 2. VERIFIED CERTIFICATIONS (20% Weight)
  // ==========================================
  const verifiedCerts = certificates.filter((c) => c.status === 'Verified');
  const requiredCerts = project.requiredCertifications || [];
  
  let certMatch = 0;
  const matchedCertificates = [];
  const missingCertificates = [];

  if (requiredCerts.length === 0) {
    certMatch = verifiedCerts.length > 0 ? 100 : 70;
    if (verifiedCerts.length > 0) {
      strengths.push(`Holds ${verifiedCerts.length} verified accreditation(s) on passport`);
      reasons.push(`✓ Holds ${verifiedCerts.length} accredited renewable certification(s)`);
    }
  } else {
    let matchedCount = 0;

    requiredCerts.forEach((reqCert) => {
      const cleanReq = reqCert.toLowerCase().trim();
      const found = verifiedCerts.find((vc) => {
        const cleanCert = vc.certificateName.toLowerCase().trim();
        return (
          cleanCert.includes(cleanReq) ||
          cleanReq.includes(cleanCert) ||
          (cleanReq.includes('solar') && vc.category === 'Solar') ||
          (cleanReq.includes('wind') && vc.category === 'Wind') ||
          (cleanReq.includes('gwo') && cleanCert.includes('gwo'))
        );
      });

      if (found) {
        matchedCount++;
        matchedCertificates.push({
          certificateName: found.certificateName,
          issuingOrganization: found.issuingOrganization,
          certificateNumber: found.certificateNumber,
        });
      } else {
        missingCertificates.push(reqCert);
      }
    });

    if (matchedCount > 0) {
      certMatch = Math.min(100, Math.round((matchedCount / requiredCerts.length) * 100));
      strengths.push(
        `Holds verified required certification: ${matchedCertificates[0].certificateName}`
      );
      reasons.push(
        `✓ Verified credential active: ${matchedCertificates.map((c) => c.certificateName).slice(0, 2).join(', ')}`
      );
    } else if (verifiedCerts.length > 0) {
      certMatch = 50;
      reasons.push(`ℹ Holds verified credentials in related domain, but not exact requisite`);
      gapAnalysis.push(`Mandatory certificate pending verification: ${requiredCerts.join(', ')}`);
    } else {
      certMatch = 15;
      gapAnalysis.push('No verified accreditation records found in Digital Skill Passport');
      reasons.push('⚠ Independent certification verification required before mobilization');
    }
  }

  // ==========================================
  // 3. FIELD EXPERIENCE (15% Weight)
  // ==========================================
  const techExp = Number(technicianProfile?.yearsOfExperience) || 0;
  const projectMinExp = Number(project.minimumExperience) || 1;
  const previousProjects = technicianProfile?.previousProjects || [];
  
  let expMatch = 0;
  if (techExp >= projectMinExp + 2) {
    expMatch = 100;
    strengths.push(`Senior experience: ${techExp} yrs (exceeds ${projectMinExp}+ yrs requirement)`);
    reasons.push(`✓ Senior track record: ${techExp} years in field operations`);
  } else if (techExp >= projectMinExp) {
    expMatch = 95;
    strengths.push(`${techExp} yrs field experience fulfills project seniority criteria`);
    reasons.push(`✓ ${techExp} years experience meets ${projectMinExp}+ yrs requirement`);
  } else if (techExp > 0) {
    expMatch = Math.max(30, Math.round((techExp / projectMinExp) * 80));
    gapAnalysis.push(
      `Experience (${techExp} yr${techExp > 1 ? 's' : ''}) is below preferred ${projectMinExp} yrs`
    );
    reasons.push(`ℹ ${techExp} year(s) active field experience`);
  } else {
    expMatch = 25;
    gapAnalysis.push('Entry-level field track record');
    reasons.push('ℹ Entry-level technician looking for apprentice placement');
  }

  if (previousProjects.length >= 2) {
    expMatch = Math.min(100, expMatch + 5);
    strengths.push(`Proven delivery on ${previousProjects.length} documented clean energy installations`);
  }

  // ==========================================
  // 4. GEOGRAPHIC PROXIMITY & MOBILITY (10% Weight)
  // ==========================================
  const projCity = (project.location?.city || '').toLowerCase().trim();
  const projState = (project.location?.state || '').toLowerCase().trim();
  const techCity = (technicianProfile?.city || '').toLowerCase().trim();
  const techState = (technicianProfile?.state || '').toLowerCase().trim();
  const preferredLocs = (technicianProfile?.preferredWorkLocations || []).map((l) =>
    l.toLowerCase().trim()
  );

  let locMatch = 40;
  let proximityDescription = '';

  if (projCity && techCity && (projCity === techCity || techCity.includes(projCity) || projCity.includes(techCity))) {
    locMatch = 100;
    proximityDescription = `Local technician based in ${project.location.city}`;
    strengths.push(`Immediate local availability in ${project.location.city} (Zero relocation overhead)`);
    reasons.push(`✓ Direct local proximity in ${project.location.city}`);
  } else if (
    projState &&
    (techState === projState ||
      preferredLocs.some((pl) => pl.includes(projState) || projState.includes(pl)))
  ) {
    locMatch = 85;
    proximityDescription = `Regional technician in ${technicianProfile.state || project.location.state}`;
    strengths.push(`Operates within ${project.location.state} regional cluster`);
    reasons.push(`✓ Regional mobility within ${project.location.state}`);
  } else if (
    preferredLocs.some((pl) => pl === 'all india' || pl === 'pan-india' || pl === 'india')
  ) {
    locMatch = 80;
    proximityDescription = 'Pan-India mobile workforce';
    strengths.push('Designated for nationwide utility project mobilization');
    reasons.push(`✓ Pan-India mobilization clearance`);
  } else {
    locMatch = 50;
    proximityDescription = 'Interstate mobilization required';
    gapAnalysis.push('Site travel allowance or on-site accommodation needed');
    reasons.push(`ℹ Interstate travel coordination required`);
  }

  // ==========================================
  // 5. TIMELINE & AVAILABILITY (10% Weight)
  // ==========================================
  const availStatus = technicianProfile?.currentAvailability || 'Available';
  let availMatch = 0;

  if (availStatus === 'Available') {
    availMatch = 100;
    strengths.push('Immediately ready for on-site deployment');
    reasons.push('✓ Immediately available for mobilization');
  } else if (availStatus === 'On Project') {
    availMatch = 45;
    gapAnalysis.push('Currently assigned to an ongoing project; verify rollout schedule');
    reasons.push('ℹ Currently on active assignment; near-term transition needed');
  } else {
    availMatch = 10;
    gapAnalysis.push('Marked as unavailable in registry');
    reasons.push('⚠ Listed as unavailable for upcoming project dates');
  }

  // ==========================================
  // 6. COMPETENCY ASSESSMENTS (5% Weight)
  // ==========================================
  const matchingAssessment = assessmentResults.find(
    (ar) => ar.category === project.projectType
  );
  const overallSkillScore = Number(technicianProfile?.overallSkillScore) || 0;

  let assessmentMatch = 0;
  if (matchingAssessment && matchingAssessment.scorePercentage >= 85) {
    assessmentMatch = 100;
    strengths.push(`Passed standardized ${matchingAssessment.category} assessment with ${matchingAssessment.scorePercentage}% (Master)`);
    reasons.push(`✓ Standardized assessment excellence: ${matchingAssessment.scorePercentage}%`);
  } else if (matchingAssessment && matchingAssessment.scorePercentage >= 70) {
    assessmentMatch = 85;
    strengths.push(`Verified competency test score of ${matchingAssessment.scorePercentage}% in ${matchingAssessment.category}`);
    reasons.push(`✓ Verified competency pass: ${matchingAssessment.scorePercentage}%`);
  } else if (overallSkillScore >= 80) {
    assessmentMatch = 90;
    strengths.push(`High verified technical skill index (${overallSkillScore}%)`);
    reasons.push(`✓ Skill passport index: ${overallSkillScore}%`);
  } else if (overallSkillScore >= 60) {
    assessmentMatch = 75;
    reasons.push(`ℹ Skill passport index: ${overallSkillScore}%`);
  } else {
    assessmentMatch = 50;
    reasons.push(`ℹ Technical assessment pending`);
  }

  // ==========================================
  // 7. CONTRACTOR RATING & TRACK RECORD (5% Weight)
  // ==========================================
  const rawRating = Number(technicianProfile?.averageRating) || 5.0;
  const ratingMatch = Math.min(100, Math.round((rawRating / 5.0) * 100));
  const ratingsCount = technicianProfile?.ratingsCount || 0;

  if (rawRating >= 4.5) {
    strengths.push(`Top-rated contractor track record: ${rawRating.toFixed(1)} / 5.0 stars`);
    reasons.push(`✓ ${rawRating.toFixed(1)} / 5.0 contractor rating (${ratingsCount} reviews)`);
  } else {
    reasons.push(`✓ ${rawRating.toFixed(1)} / 5.0 contractor rating`);
  }

  // ==========================================
  // COMPUTE FINAL WEIGHTED SCORE
  // ==========================================
  const finalRaw =
    skillMatch * 0.35 +
    certMatch * 0.20 +
    expMatch * 0.15 +
    locMatch * 0.10 +
    availMatch * 0.10 +
    assessmentMatch * 0.05 +
    ratingMatch * 0.05;

  const matchScore = Math.min(100, Math.max(10, Math.round(finalRaw)));

  // Generate Executive AI Narrative Summary
  let summaryNarrative = '';
  const candidateName = technicianUser?.name || 'Technician';
  const projTitle = project.projectName || 'Project';

  if (matchScore >= 90) {
    summaryNarrative = `Exceptional ${matchScore}% match for "${projTitle}". ${candidateName} demonstrates superior ${project.projectType} alignment with ${matchedSkills.length} verified required skills, accredited credentials, and ${proximityDescription.toLowerCase()}. Recommended for immediate deployment.`;
  } else if (matchScore >= 75) {
    summaryNarrative = `Strong qualified ${matchScore}% match for "${projTitle}". Fulfills core technical responsibilities with solid field experience (${techExp} yrs) and accredited skills. Minor logistics or schedule synchronization may be reviewed.`;
  } else if (matchScore >= 60) {
    summaryNarrative = `Moderate ${matchScore}% match for "${projTitle}". Meets foundational renewable competency requirements but may benefit from onboarding support on specific skills (${missingSkills.slice(0, 2).join(', ') || 'specialized tasks'}) or travel planning.`;
  } else {
    summaryNarrative = `Foundational ${matchScore}% match for "${projTitle}". Candidate demonstrates emerging renewable capabilities; however, key prerequisites in certifications or senior field experience are pending.`;
  }

  // Structured breakdown object
  const breakdown = {
    weights: {
      skills: 35,
      certifications: 20,
      experience: 15,
      location: 10,
      availability: 10,
      assessment: 5,
      rating: 5,
    },
    skillScore: skillMatch,
    certScore: certMatch,
    expScore: expMatch,
    locScore: locMatch,
    availScore: availMatch,
    assessmentScore: assessmentMatch,
    ratingScore: ratingMatch,
    matchedSkills,
    missingSkills,
    matchedCertificates,
    missingCertificates,
    strengths,
    gapAnalysis,
    reasons,
    summaryNarrative,
    proximityDescription,
  };

  return {
    matchScore,
    breakdown,
  };
}

module.exports = {
  calculateMatchScore,
};
