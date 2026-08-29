const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('C:\\Users\\Wendell\\.gemini\\antigravity-ide\\brain\\f0199921-2adc-46fc-ab4e-06fc1a9447e0\\scratch\\mahavillages.html', 'utf8');
const $ = cheerio.load(html);

const srcs = [];
$('script').each((i, el) => {
  if ($(el).attr('src')) srcs.push($(el).attr('src'));
});
console.log(srcs.join('\n'));
