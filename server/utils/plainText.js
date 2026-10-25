const namedEntities = {
  nbsp: ' ',
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'"
};

function cleanPlainText(value) {
  if (typeof value !== 'string') return '';

  const decodeEntities = text => text
    .replace(/&(?:nbsp|amp|lt|gt|quot|apos);/gi, entity => namedEntities[entity.slice(1, -1).toLowerCase()])
    .replace(/&#(\d+);/g, (entity, code) => {
      const point = Number(code);
      return point <= 0x10ffff ? String.fromCodePoint(point) : entity;
    })
    .replace(/&#x([0-9a-f]+);/gi, (entity, code) => {
      const point = parseInt(code, 16);
      return point <= 0x10ffff ? String.fromCodePoint(point) : entity;
    });

  return decodeEntities(decodeEntities(value))
    .replace(/<\/?[a-z][a-z0-9:-]*(?:\s[^<>]*?)?\s*\/?>/gi, ' ')
    .replace(/[ \t\f\v]+/g, ' ')
    .replace(/\\[nr]/gi, '\n')
    .replace(/\r\n?/g, '\n')
    .replace(/ *\n */g, '\n')
    .replace(/(^|\s)\d{1,2}[.)]\s+(?=[A-Za-z])/g, '$1')
    .replace(/(\.)[ \t]+/g, '$1\n')
    .replace(/\n{2,}/g, '\n')
    .replace(/ {2,}/g, ' ')
    .trim();
}

function cleanRecord(value) {
  if (typeof value === 'string') return cleanPlainText(value);
  if (Array.isArray(value)) return value.map(cleanRecord);
  if (!value || typeof value !== 'object' || value instanceof Date) return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [key, cleanRecord(nestedValue)])
  );
}

module.exports = { cleanPlainText, cleanRecord };
