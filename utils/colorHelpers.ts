/**
 * Shared color helper utilities for NFL HQ
 */

/**
 * Calculate relative luminance of a hex color
 * Based on WCAG 2.1 formula
 */
function getLuminance(hex: string): number {
  const rgb = hex.replace('#', '').match(/.{2}/g);
  if (!rgb) return 0;

  const [r, g, b] = rgb.map(c => {
    const val = parseInt(c, 16) / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Check if white text has sufficient contrast on a background color
 * Returns true if white text is readable, false if dark text should be used
 * Uses WCAG 2.1 AA standard (4.5:1 contrast ratio)
 */
export function shouldUseWhiteText(hexColor: string): boolean {
  const bgLuminance = getLuminance(hexColor);
  const whiteLuminance = 1;
  const darkLuminance = 0; // Black

  // Contrast ratio formula: (L1 + 0.05) / (L2 + 0.05)
  const whiteContrast = (whiteLuminance + 0.05) / (bgLuminance + 0.05);
  const darkContrast = (bgLuminance + 0.05) / (darkLuminance + 0.05);

  // Use white text if contrast ratio with white is >= 4.5 (WCAG AA)
  // Or if white has better contrast than dark
  return whiteContrast >= 4.5 || whiteContrast > darkContrast;
}

/**
 * Get the appropriate text color (white or dark) for a background color
 */
export function getContrastTextColor(hexColor: string): string {
  return shouldUseWhiteText(hexColor) ? '#FFFFFF' : '#1a1a1a';
}

/**
 * Get Tailwind color classes for position badge based on position abbreviation
 */
export const getPositionColor = (position: string): string => {
  const pos = position.toUpperCase();

  // Quarterbacks
  if (pos === 'QB') {
    return 'bg-purple-100 text-purple-700 border-purple-200';
  }
  // Running Backs
  else if (pos === 'RB' || pos === 'FB') {
    return 'bg-green-100 text-green-700 border-green-200';
  }
  // Wide Receivers / Tight Ends
  else if (pos === 'WR' || pos === 'TE') {
    return 'bg-blue-100 text-blue-700 border-blue-200';
  }
  // Offensive Line
  else if (pos === 'OT' || pos === 'OG' || pos === 'C' || pos === 'OL') {
    return 'bg-amber-100 text-amber-700 border-amber-200';
  }
  // Defensive Line
  else if (pos === 'DE' || pos === 'DT' || pos === 'NT' || pos === 'DL') {
    return 'bg-red-100 text-red-700 border-red-200';
  }
  // Linebackers
  else if (pos === 'LB' || pos === 'ILB' || pos === 'OLB' || pos === 'MLB') {
    return 'bg-orange-100 text-orange-700 border-orange-200';
  }
  // Defensive Backs
  else if (pos === 'CB' || pos === 'S' || pos === 'FS' || pos === 'SS' || pos === 'DB') {
    return 'bg-cyan-100 text-cyan-700 border-cyan-200';
  }
  // Special Teams
  else if (pos === 'K' || pos === 'P' || pos === 'LS') {
    return 'bg-pink-100 text-pink-700 border-pink-200';
  }

  return 'bg-gray-100 text-gray-700 border-gray-200';
};

/**
 * Get Tailwind color classes for injury status badge
 */
export const getStatusColor = (status: string): string => {
  const statusLower = status.toLowerCase();

  if (statusLower.includes('ir') || statusLower.includes('injured reserve')) {
    return 'bg-red-100 text-red-800 border-red-600';
  }
  if (statusLower.includes('pup') || statusLower.includes('physically unable')) {
    return 'bg-purple-50 text-purple-700 border-purple-400';
  }
  if (statusLower.includes('nfi') || statusLower.includes('non-football')) {
    return 'bg-indigo-50 text-indigo-700 border-indigo-400';
  }
  if (statusLower.includes('out')) {
    return 'bg-red-50 text-red-700 border-red-400';
  }
  if (statusLower.includes('doubtful')) {
    return 'bg-orange-50 text-orange-700 border-orange-400';
  }
  if (statusLower.includes('questionable')) {
    return 'bg-yellow-50 text-yellow-700 border-yellow-400';
  }
  if (statusLower.includes('probable')) {
    return 'bg-green-50 text-green-700 border-green-400';
  }

  return 'bg-gray-100 text-gray-700 border-gray-200';
};
