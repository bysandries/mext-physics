export const PARTS = [
  { number: 1, name: 'Mechanics', slug: 'mechanics', color: '#3b82f6', topics: [1, 13] },
  { number: 2, name: 'Thermodynamics', slug: 'thermodynamics', color: '#ef4444', topics: [14, 25] },
  { number: 3, name: 'Waves & Sound', slug: 'waves-sound', color: '#22c55e', topics: [26, 31] },
  { number: 4, name: 'Electricity & Magnetism', slug: 'electricity-magnetism', color: '#f59e0b', topics: [32, 42] },
  { number: 5, name: 'Optics', slug: 'optics', color: '#a855f7', topics: [43, 46] },
] as const;

export const SITE_TITLE = 'MEXT Physics Study';
export const SITE_DESC = 'Interactive study guide for the MEXT Scholarship Physics exam';
