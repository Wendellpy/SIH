const fs = require('fs');
const html = fs.readFileSync('C:/Users/Wendell/.gemini/antigravity-ide/brain/98197fb2-025c-4603-aa8f-d7c1d4e65dda/.system_generated/steps/297/content.md', 'utf8');
const regex = /<img[^>]+src=["']([^"']+)["']/g;
let match;
const urls = new Set();
while(match = regex.exec(html)) {
    urls.add(match[1]);
}
console.log(Array.from(urls).filter(u => u.toLowerCase().includes('floor') || u.toLowerCase().includes('plan') || u.toLowerCase().includes('aquaria')).join('\n'));
