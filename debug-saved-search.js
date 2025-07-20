// Debug script to test saved search loading

const savedSearchData = {
  id: "cmdc2y39x0000sariltunrymj",
  name: "Aerospace Engineer in Dever",
  query: "\"aerospace engineer\"",
  filters: JSON.parse('{"location":"Denver, CO","remote":false,"entryLevel":true,"jobType":["full-time"],"experienceLevel":"entry","sites":["linkedin.com"]}')
};

console.log('=== SAVED SEARCH DEBUG ===');
console.log('ID:', savedSearchData.id);
console.log('Name:', savedSearchData.name);
console.log('Query:', savedSearchData.query);
console.log('Filters:', savedSearchData.filters);

console.log('\n=== FILTER ANALYSIS ===');
console.log('Location:', savedSearchData.filters.location);
console.log('Remote:', savedSearchData.filters.remote);
console.log('Entry Level:', savedSearchData.filters.entryLevel);
console.log('Job Type:', savedSearchData.filters.jobType);
console.log('Experience Level:', savedSearchData.filters.experienceLevel);
console.log('Sites:', savedSearchData.filters.sites);

console.log('\n=== URL ENCODING TEST ===');
const queryParam = encodeURIComponent(savedSearchData.query);
const filtersParam = encodeURIComponent(JSON.stringify(savedSearchData.filters));

console.log('Query param:', queryParam);
console.log('Filters param:', filtersParam);

console.log('\n=== URL DECODING TEST ===');
const decodedQuery = decodeURIComponent(queryParam);
const decodedFilters = JSON.parse(decodeURIComponent(filtersParam));

console.log('Decoded query:', decodedQuery);
console.log('Decoded filters:', decodedFilters);

console.log('\n=== FILTER VALIDATION ===');
const hasNonDefaultFilters = Object.values(savedSearchData.filters).some(value => {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.trim() !== '';
  return value !== undefined;
});

console.log('Has non-default filters:', hasNonDefaultFilters);

// Test specific filter values
console.log('\n=== INDIVIDUAL FILTER TESTS ===');
console.log('Location check:', savedSearchData.filters.location && savedSearchData.filters.location.trim() !== '');
console.log('Job type check:', Array.isArray(savedSearchData.filters.jobType) && savedSearchData.filters.jobType.length > 0);
console.log('Sites check:', Array.isArray(savedSearchData.filters.sites) && savedSearchData.filters.sites.length > 0);
console.log('Remote check:', savedSearchData.filters.remote);
console.log('Entry level check:', savedSearchData.filters.entryLevel);
