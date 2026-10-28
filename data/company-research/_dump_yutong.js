const d = require('./yutong.json');
for (const k of ['overview', 'current', 'leadership', 'competition', 'outlook', 'risks']) {
  for (const l of ['en', 'zh']) {
    console.log('===== ' + k + '.' + l + ' =====');
    const s = d.sections[k][l];
    let rest = s;
    while (rest.length > 160) { console.log(rest.slice(0, 160)); rest = rest.slice(160); }
    console.log(rest);
  }
}
