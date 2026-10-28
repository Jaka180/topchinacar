const d = require('./xpeng.json');
for (const k of ['current', 'competition', 'outlook', 'risks']) {
  console.log('==== ' + k + '.en ====');
  console.log(d.sections[k].en);
  console.log('==== ' + k + '.zh ====');
  console.log(d.sections[k].zh);
}
