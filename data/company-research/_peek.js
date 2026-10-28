const d = require('./geely.json');
const en = d.sections.leadership.en;
const i = en.indexOf('36.62');
console.log('---EN AROUND 36.62---');
console.log(JSON.stringify(en.slice(Math.max(0, i - 300), i + 300)));
