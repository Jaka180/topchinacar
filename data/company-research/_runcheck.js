// Temporary runner: loads the html-entities shim, then validates byd.json
// with the same code the site uses (lib/research-validation.js).
require('./_shim.js');
const path = require('path');
const { checkFile } = require('../../lib/research-validation');
const file = path.resolve(__dirname, 'byd.json');
const result = checkFile(file);
result.errors.forEach(m => console.error('错误：' + m));
result.warnings.forEach(m => console.warn('警告：' + m));
if (result.errors.length) process.exitCode = 1;
else console.log('校验通过');
