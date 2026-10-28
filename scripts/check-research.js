#!/usr/bin/env node
// 可传入一个或多个文件；默认只检查正式研究目录。
const path = require('node:path');
const { checkFile, researchFiles } = require('../lib/research-validation');
const files = process.argv.slice(2);
if (!files.length) files.push(...researchFiles(path.resolve(process.env.RESEARCH_DIR || path.join(__dirname, '../data/company-research'))));
for (const file of files) {
  const result = checkFile(file);
  result.errors.forEach(message => console.error(`${file}: 错误：${message}`));
  result.warnings.forEach(message => console.warn(`${file}: 警告：${message}`));
  if (result.errors.length) process.exitCode = 1;
  else console.log(`${file}: 校验通过`);
}
