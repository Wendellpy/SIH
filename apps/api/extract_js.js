const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('C:\\Users\\Wendell\\.gemini\\antigravity-ide\\brain\\f0199921-2adc-46fc-ab4e-06fc1a9447e0\\scratch\\mahavillages.html', 'utf8');
const $ = cheerio.load(html);

$('script').each((i, el) => {
  const code = $(el).html() || '';
  if (code.includes('mahvil_urban_surverynumbers_ajaxprosearch.php')) {
    fs.writeFileSync('C:\\Users\\Wendell\\.gemini\\antigravity-ide\\brain\\f0199921-2adc-46fc-ab4e-06fc1a9447e0\\scratch\\ajax_logic.js', code);
    console.log("Extracted JS to ajax_logic.js");
  }
});
