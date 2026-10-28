const d = require('./changan.json');
for (const k of ['overview', 'current', 'leadership', 'competition', 'outlook', 'risks']) {
  console.log('======== ' + k + '.en ========');
  console.log(d.sections[k].en);
  console.log('======== ' + k + '.zh ========');
  console.log(d.sections[k].zh);
}
