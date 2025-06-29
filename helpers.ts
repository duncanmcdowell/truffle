// Shared helpers for all VC firms/job boards

export type VC_FIRM = {
  name: string;
  platform: 'consider' | 'getro'; // Add other platforms as they are built
  enabled: boolean;
  apiUrl?: string;
  boardId?: string;
};

// List of all VC firms, their job board platform, and enabled state
export const VC_FIRMS: VC_FIRM[] = [
  { name: 'sequoia', platform: 'consider', enabled: true, boardId: 'sequoia-capital', apiUrl: 'https://jobs.sequoiacap.com/api-boards/search-jobs' },
  { name: 'a16z', platform: 'consider', enabled: true, boardId: 'andreessen-horowitz', apiUrl: 'https://jobs.a16z.com/api-boards/search-jobs' },
  { name: 'accel', platform: 'getro', enabled: true, boardId: '8672', apiUrl: 'https://api.getro.com/api/v2/collections/8672/search/jobs' },
  { name: 'bessemer-venture-partners', platform: 'consider', enabled: true, boardId: 'bessemer-ventures', apiUrl: 'https://jobs.bvp.com/api-boards/search-jobs' },
  { name: 'kleiner-perkins', platform: 'consider', enabled: true, boardId: 'kleiner-perkins', apiUrl: 'https://jobs.kleinerperkins.com/api-boards/search-jobs' },
  { name: 'tiger-global-management', platform: 'consider', enabled: false },
  { name: 'insight-partners', platform: 'getro', enabled: true, boardId: '246', apiUrl: 'https://api.getro.com/api/v2/collections/246/search/jobs' },
  { name: 'lightspeed-venture-partners', platform: 'consider', enabled: true, boardId: 'lightspeed', apiUrl: 'https://jobs.lsvp.com/api-boards/search-jobs' },
  { name: 'greylock-partners', platform: 'consider', enabled: true, boardId: 'greylock-partners', apiUrl: 'https://jobs.greylock.com/api-boards/search-jobs' },
  { name: 'gv', platform: 'consider', enabled: true, boardId: 'gv', apiUrl: 'https://jobs.gv.com/api-boards/search-jobs' },
  { name: 'khosla-ventures', platform: 'getro', enabled: true, boardId: '257', apiUrl: 'https://api.getro.com/api/v2/collections/257/search/jobs' },
  { name: 'index-ventures', platform: 'consider', enabled: false },
  { name: 'founders-fund', platform: 'consider', enabled: false },
  { name: 'general-catalyst', platform: 'consider', enabled: false },
  { name: 'nea', platform: 'consider', enabled: true, boardId: 'nea', apiUrl: 'https://careers.nea.com/api-boards/search-jobs' },
  { name: 'union-square-ventures', platform: 'consider', enabled: true, boardId: 'union-square-ventures', apiUrl: 'https://jobs.usv.com/api-boards/search-jobs' },
  { name: 'true-ventures', platform: 'getro', enabled: true, boardId: '646', apiUrl: 'https://api.getro.com/api/v2/collections/646/search/jobs' },
  { name: 'softbank-vision-fund', platform: 'consider', enabled: false },
  { name: 'tcv', platform: 'getro', enabled: true, boardId: '6428', apiUrl: 'https://api.getro.com/api/v2/collections/6428/search/jobs' },
  { name: 'canaan-partners', platform: 'consider', enabled: false },
  { name: 'madrona-venture-group', platform: 'consider', enabled: false },
  { name: 'real-ventures', platform: 'getro', enabled: true, boardId: '166', apiUrl: 'https://api.getro.com/api/v2/collections/166/search/jobs' },
  {name: 'inovia', platform: 'consider', enabled: true, boardId: 'inovia', apiUrl: 'https://careers.inovia.vc/api-boards/search-jobs' },
];
