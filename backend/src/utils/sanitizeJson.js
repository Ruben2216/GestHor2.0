const ISO_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

const formatDateDDMMYYYY = (dateStr) => {
  const parts = String(dateStr).split('-');
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  return `${d}-${m}-${y}`;
};

const toDateOnly = (s) => {
  if (typeof s !== 'string') return s;
  if (ISO_REGEX.test(s)) return formatDateDDMMYYYY(s.split('T')[0]);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return formatDateDDMMYYYY(s);
  return s;
};

const sanitize = (obj) => {
  if (obj == null) return obj;
  if (obj instanceof Date) return formatDateDDMMYYYY(obj.toISOString().split('T')[0]);
  if (Array.isArray(obj)) return obj.map(sanitize);
  if (typeof obj === 'object') {
    const out = {};
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (v instanceof Date) {
        out[k] = formatDateDDMMYYYY(v.toISOString().split('T')[0]);
      } else if (typeof v === 'string') {
        out[k] = toDateOnly(v);
      } else if (v && typeof v === 'object') {
        out[k] = sanitize(v);
      } else {
        out[k] = v;
      }
    }
    return out;
  }
  if (typeof obj === 'string') return toDateOnly(obj);
  return obj;
};

export { sanitize };
