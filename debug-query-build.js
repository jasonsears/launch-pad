// Test the query building logic with the saved search filters

const filters = {
  location: 'Denver, CO',
  remote: false,
  entryLevel: true,
  jobType: ['full-time'],
  experienceLevel: 'entry',
  sites: ['linkedin.com']
};

const query = '"aerospace engineer"';

// Simulate the buildQuery function logic
let searchQuery = query;

console.log('=== QUERY BUILDING TEST ===');
console.log('Original query:', query);

// Check if query already contains job-related keywords
const jobKeywords = ['job', 'position', 'career', 'hiring', 'employment', 'vacancy', 'opening'];
const hasJobKeyword = jobKeywords.some(keyword => 
  searchQuery.toLowerCase().includes(keyword.toLowerCase())
);

console.log('Has job keyword:', hasJobKeyword);

if (!hasJobKeyword) {
  searchQuery += ' (job OR position OR hiring OR career OR opening)';
  console.log('Added job keywords:', searchQuery);
}

// Add job posting indicators
searchQuery += ' (apply OR "job description" OR requirements OR qualifications OR "years of experience")';
console.log('Added job indicators:', searchQuery);

// Add location filter
if (filters.location) {
  searchQuery += ` location:"${filters.location}"`;
  console.log('Added location:', searchQuery);
}

// Add remote filter
if (filters.remote) {
  searchQuery += ' (remote OR "work from home" OR WFH)';
  console.log('Added remote filter');
} else {
  console.log('Skipped remote filter (false)');
}

// Add experience level filter
if (filters.experienceLevel) {
  switch (filters.experienceLevel) {
    case 'entry':
      searchQuery += ' ("entry level" OR junior OR graduate OR "new grad")';
      console.log('Added entry level filter:', searchQuery);
      break;
    case 'mid':
      searchQuery += ' ("mid level" OR experienced OR "3-5 years")';
      break;
    case 'senior':
      searchQuery += ' (senior OR lead OR "5+ years" OR principal)';
      break;
  }
}

// Add job type filter
if (filters.jobType && filters.jobType.length > 0) {
  const jobTypeMap = {
    'full-time': 'full time OR fulltime',
    'part-time': 'part time OR parttime',
    'contract': 'contract OR contractor OR freelance',
    'internship': 'intern OR internship'
  };
  
  const jobTypeQueries = filters.jobType.map(type => `(${jobTypeMap[type]})`);
  searchQuery += ` (${jobTypeQueries.join(' OR ')})`;
  console.log('Added job type filter:', searchQuery);
}

// Add site filtering
if (filters.sites && filters.sites.length > 0) {
  const siteQueries = filters.sites.map(site => `site:${site}`);
  searchQuery += ` (${siteQueries.join(' OR ')})`;
  console.log('Added site filter:', searchQuery);
}

// Add content exclusions
searchQuery += ' -wikipedia -"about us" -"our company" -blog -news -"press release" -"company profile" -investor';
console.log('Added exclusions:', searchQuery);

console.log('\n=== FINAL QUERY ===');
console.log('Length:', searchQuery.length);
console.log('Query:', searchQuery);

console.log('\n=== QUERY ANALYSIS ===');
if (searchQuery.length > 400) {
  console.log('⚠️  WARNING: Query is very long, might hit Google search limits');
}

// Check for potential issues
if (searchQuery.includes('""')) {
  console.log('⚠️  WARNING: Empty quotes detected');
}

if (searchQuery.includes('location:""')) {
  console.log('⚠️  WARNING: Empty location filter');
}

console.log('✅ Query building complete');
