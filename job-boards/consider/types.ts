// Types for Consider job board API

export type ConsiderJobRequest = {
  meta: { size: number };
  board: { id: string; isParent: boolean };
  query: {
    remoteOnly: boolean;
    hybridOnly: boolean;
    hybridOrRemoteOnly: boolean;
    titlePrefix: string;
    promoteFeatured: boolean;
  };
  grouped: boolean;
};

export type ConsiderApiResponse = {
  version: {
    client: { git: string; date: string };
    server: { git: string; date: string };
  };
  jobs: ConsiderJobGroup[];
  meta: { size: number };
  total: number;
  errors: unknown[];
  debug: unknown[];
};

export type ConsiderJobGroup = {
  company: ConsiderCompany;
  jobs: ConsiderJob[];
  numMatchingJobs: number;
};

export type ConsiderCompany = {
  id: string;
  name: string;
  slug: string;
  description: string;
  domain: string;
  emailDomains: string[];
  investorSlugs: string[];
  investors: string[];
  jobSources: unknown[];
  logos: {
    manual?: ConsiderLogo;
    linkedin?: ConsiderLogo;
  };
  markets: string[];
  marketsLV: ConsiderLabelValue[];
  officeLocations: string[];
  officeLocationsLV: ConsiderLabelValue[];
  skills: string[];
  skillsLV: ConsiderLabelValue[];
  staffCount: number;
  numJobs: number;
  numRemoteJobs: number;
  fractionRemote: number;
  numInternships: number;
  numManagerJobs: number;
  parentSlugs: string[];
  parents: string[];
  stages: string[];
  stagesLV: ConsiderLabelValue[];
  fundingLV: ConsiderLabelValue;
  sizeLV: ConsiderLabelValue;
  isFeatured: boolean;
  isRemoteFriendly: boolean;
  website: { url: string; label: string };
};

export type ConsiderLogo = {
  height: number;
  width: number;
  src: string;
};

export type ConsiderLabelValue = {
  id: string;
  label: string;
  value: string;
};

export type ConsiderJob = {
  applyUrl: string;
  companyDomain: string;
  companyLogos: {
    manual?: ConsiderLogo;
    linkedin?: ConsiderLogo;
  };
  companyId: string;
  companySlug: string;
  companyName: string;
  considerHosted: boolean;
  departments: string[];
  jobTypes: ConsiderLabelValue[];
  jobFunctions: unknown[];
  locations: string[];
  normalizedLocations: ConsiderLabelValue[];
  salary?: {
    period: { label: string; value: string };
    minValue: number;
    maxValue: number;
    currency: { label: string; value: string };
    isOriginal: boolean;
  };
  skills: ConsiderLabelValue[];
  requiredSkills: ConsiderLabelValue[];
  preferredSkills: ConsiderLabelValue[];
  manager: boolean;
  consultant: boolean;
  contractor: boolean;
  considerLevels: number[][];
  regions: ConsiderLabelValue[];
  stages: ConsiderLabelValue[];
  markets: ConsiderLabelValue[];
  timeStamp: string;
  title: string;
  url: string;
  jobId: string;
  remote: boolean;
  hybrid: boolean;
  scores: {
    score: number;
    matchScore: number;
    ageScore: number;
    richnessScore: number;
  };
  atsJobs: unknown[];
  matchingTalent: { count: number; matches: unknown[] };
  jobSeniorities: ConsiderLabelValue[];
  jobSeniorityIds: string[];
  isFeatured: boolean;
};
