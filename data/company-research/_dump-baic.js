const fs = require('fs');
const lines = fs.readFileSync(__dirname + '/baic.json', 'utf8').split('\n');
[319, 323, 324, 327, 331, 335].forEach(n => console.log('=====LINE ' + n + '=====\n' + lines[n - 1] + '\n'));
