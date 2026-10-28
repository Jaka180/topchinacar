// HTML5 named references, including legacy forms without a semicolon.
// html-entities.json is generated from Python's standard-library html.entities.html5
// (WHATWG HTML named character references); no build-time Python dependency.
const entities = require('./html-entities.json');
const replacements = {
  128: 8364, 130: 8218, 131: 402, 132: 8222, 133: 8230, 134: 8224,
  135: 8225, 136: 710, 137: 8240, 138: 352, 139: 8249, 140: 338,
  142: 381, 145: 8216, 146: 8217, 147: 8220, 148: 8221, 149: 8226,
  150: 8211, 151: 8212, 152: 732, 153: 8482, 154: 353, 155: 8250,
  156: 339, 158: 382, 159: 376
};
function decodeHtmlEntities(value, attribute = false) {
  return String(value ?? '').replace(/&(#(?:x[0-9a-f]+|[0-9]+);?|[a-z][a-z0-9]*;?)/gi, (all, reference, offset, input) => {
    if (reference[0] === '#') {
      let code = /^#x/i.test(reference) ? parseInt(reference.slice(2), 16) : parseInt(reference.slice(1), 10);
      if (!code || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) code = 0xfffd;
      return String.fromCodePoint(replacements[code] || code);
    }
    // HTML uses the longest registered name, with case-sensitive lookup.
    for (let length = reference.length; length > 0; length--) {
      const name = reference.slice(0, length);
      if (!Object.hasOwn(entities, name)) continue;
      const next = input[offset + 1 + length] || '';
      if (attribute && !name.endsWith(';') && /[=a-z0-9]/i.test(next)) return all;
      return entities[name] + reference.slice(length);
    }
    return all;
  });
}
module.exports = { decodeHtmlEntities };
