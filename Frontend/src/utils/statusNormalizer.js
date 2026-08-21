/**
 * Normalizes any backend project status to a standard frontend display status.
 * Handles different cases and synonyms (e.g. suspended vs delayed).
 */
export const normalizeProjectStatus = (statusVal) => {
  if (!statusVal) return 'On Track';
  const cleanStatus = statusVal.toString().trim().toLowerCase();

  switch (cleanStatus) {
    case 'active':
    case 'on_track':
    case 'ontrack':
      return 'On Track';
    case 'planning':
    case 'at_risk':
    case 'atrisk':
      return 'At Risk';
    case 'suspended':
    case 'delayed':
      return 'Delayed';
    case 'completed':
      return 'Completed';
    default:
      // Fallback: title case the string
      return cleanStatus.charAt(0).toUpperCase() + cleanStatus.slice(1);
  }
};

/**
 * Returns standard color style configurations for status badges.
 */
export const getStatusBadgeColor = (normalizedStatus) => {
  switch (normalizedStatus) {
    case 'On Track': return { bg: 'rgba(22, 163, 74, 0.08)', text: '#16A34A' };
    case 'At Risk': return { bg: 'rgba(217, 119, 6, 0.08)', text: '#D97706' };
    case 'Delayed': return { bg: 'rgba(220, 38, 38, 0.08)', text: '#DC2626' };
    case 'Completed': return { bg: 'rgba(107, 114, 128, 0.08)', text: '#6B7280' };
    default: return { bg: 'rgba(22, 163, 74, 0.08)', text: '#16A34A' };
  }
};
