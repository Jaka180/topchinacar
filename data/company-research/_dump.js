const d = require('./dongfeng.json');
for (const k of ['current', 'leadership', 'outlook']) {
  console.log('==== ' + k + '.en ====');
  console.log(d.sections[k].en);
  console.log('==== ' + k + '.zh ====');
  console.log(d.sections[k].zh);
}
