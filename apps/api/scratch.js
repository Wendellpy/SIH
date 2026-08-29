const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('C:\\Users\\Wendell\\.gemini\\antigravity-ide\\brain\\f0199921-2adc-46fc-ab4e-06fc1a9447e0\\scratch\\mahavillages.html', 'utf8');
const $ = cheerio.load(html);

console.log("SELECT TAGS FOUND:");
$('select').each((i, el) => {
  console.log(`Select ID: ${$(el).attr('id')}, Name: ${$(el).attr('name')}`);
  const opts = $(el).find('option').length;
  console.log(`  Options count: ${opts}`);
  if (opts > 0 && opts < 100) {
    const first5 = [];
    $(el).find('option').each((j, opt) => {
      if (j < 5) first5.push($(opt).text().trim() + ' (' + $(opt).val() + ')');
    });
    console.log(`  Samples: ${first5.join(', ')}`);
  }
});

console.log("\nSCRIPT TAGS CONTAINING AJAX:");
$('script').each((i, el) => {
  const code = $(el).html() || '';
  if (code.includes('ajax') || code.includes('fetch') || code.includes('XMLHttpRequest') || code.includes('dist') || code.includes('taluka')) {
    console.log(`Found script matching keywords. Length: ${code.length}`);
    if (code.includes('url')) {
       console.log("Contains URL pattern:");
       const lines = code.split('\n').filter(l => l.includes('url') || l.includes('ajax'));
       console.log(lines.join('\n'));
    }
  }
});
