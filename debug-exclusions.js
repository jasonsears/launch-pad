// Test the impact of exclusions on search results

const baseQuery = '"aerospace engineer" (job OR position OR hiring OR career OR opening) (apply OR "job description" OR requirements OR qualifications OR "years of experience") location:"Denver, CO" ("entry level" OR junior OR graduate OR "new grad") ((full time OR fulltime)) (site:linkedin.com)';

const exclusions = ' -wikipedia -"about us" -"our company" -blog -news -"press release" -"company profile" -investor';

console.log('=== EXCLUSION ANALYSIS ===');
console.log('Base query length:', baseQuery.length);
console.log('Exclusions length:', exclusions.length);
console.log('Total query length:', (baseQuery + exclusions).length);

console.log('\n=== BASE QUERY ===');
console.log(baseQuery);

console.log('\n=== EXCLUSIONS ===');
console.log(exclusions);

console.log('\n=== FULL QUERY ===');
console.log(baseQuery + exclusions);

console.log('\n=== EXCLUSION IMPACT ANALYSIS ===');
console.log('The exclusions might be problematic because:');
console.log('1. -blog: Could exclude company career blogs with job posts');
console.log('2. -news: Could exclude job announcements in news articles');
console.log('3. -"about us": Could exclude company pages that mention open positions');
console.log('4. -"our company": Similar to above');
console.log('5. -"press release": Could exclude job opening announcements');
console.log('6. -"company profile": Could exclude company pages with job listings');
console.log('7. -investor: Could exclude investor pages that mention hiring');

console.log('\n=== RECOMMENDATIONS ===');
console.log('Consider making exclusions:');
console.log('1. More specific (e.g., -"about us" could exclude pages with job listings)');
console.log('2. Optional/configurable');
console.log('3. Context-aware (maybe not exclude "news" for all searches)');
console.log('4. Test with and without exclusions to see impact on results');
