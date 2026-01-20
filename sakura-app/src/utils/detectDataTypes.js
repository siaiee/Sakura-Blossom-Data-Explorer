const isCoordinateField = (fieldName) => {
  const lower = fieldName.toLowerCase();
  const coordinateKeywords = ['lat', 'latitude', 'lng', 'lon', 'longitude'];
  return coordinateKeywords.some(keyword => lower.includes(keyword));
};

const isBoolean = (value) => {
  if (value === null || value === undefined) return false;

  if (typeof value === 'boolean') return true;

  const lower = String(value).toLowerCase().trim();
  return lower === 'true' || lower === 'false' ||
         lower === 'yes' || lower === 'no';
};

const isNumber = (value) => {
  if (value === null || value === undefined || value === '') return false;

  if (typeof value === 'boolean') return false;
  const lower = String(value).toLowerCase().trim();
  if (lower === 'true' || lower === 'false' || lower === 'yes' || lower === 'no') return false;

  return !isNaN(parseFloat(value)) && isFinite(value);
};

const isDate = (value) => {
  if (value === null || value === undefined || value === '') return false;

  if (typeof value === 'boolean') return false;
  const lower = String(value).toLowerCase().trim();
  if (lower === 'true' || lower === 'false') return false;

  const parsed = new Date(value);

  if (isNaN(parsed.getTime())) return false;

  const year = parsed.getFullYear();
  if (year < 1900 || year > 2100) return false;

  return true;
};

const formatLabel = (fieldName) => {
  return fieldName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
};

const detectFieldType = (fieldName, values) => {

  const validValues = values.filter(v => v !== null && v !== undefined && v !== '');

  if (validValues.length === 0) return 'string';

  if (isCoordinateField(fieldName)) {
    return 'coordinate';
  }

  const allBooleans = validValues.every(isBoolean);
  if (allBooleans) {
    return 'boolean';
  }

  const allNumbers = validValues.every(isNumber);
  if (allNumbers) {
    return 'number';
  }

  const allDates = validValues.every(isDate);
  if (allDates) {
    return 'date';
  }

  return 'string';
};

export const detectDataTypes = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.warn('⚠️ detectDataTypes: Пустой или невалидный массив данных');
    return {};
  }

  const sampleSize = Math.min(10, data.length);
  const sample = data.slice(0, sampleSize);

  const fields = Object.keys(sample[0] || {});

  if (fields.length === 0) {
    console.warn('⚠️ detectDataTypes: Нет полей в данных');
    return {};
  }

  const types = {};

  fields.forEach(field => {

    const values = sample.map(row => row[field]);

    const type = detectFieldType(field, values);

    const label = formatLabel(field);

    types[field] = { type, label };
  });

  console.log('📊 Типы полей определены:', types);

  return types;
};

export const getFieldsByType = (types, targetType) => {
  return Object.keys(types).filter(field => types[field].type === targetType);
};

export const hasNumericFields = (types) => {
  return getFieldsByType(types, 'number').length > 0;
};

export const hasDateFields = (types) => {
  return getFieldsByType(types, 'date').length > 0;
};

export function hasCoordinates(dataTypes) {
  if (!dataTypes) return false;

  let coordCount = 0;
  let hasLat = false;
  let hasLon = false;

  Object.entries(dataTypes).forEach(([field, type]) => {
    const fieldLower = field.toLowerCase();

    if (type === 'coordinate') coordCount++;
    if (type === 'latitude') hasLat = true;
    if (type === 'longitude') hasLon = true;

    if (fieldLower.includes('lat')) hasLat = true;
    if (fieldLower.includes('lon') || fieldLower.includes('lng')) hasLon = true;
  });

  return coordCount >= 2 || (hasLat && hasLon);
}

export const hasBooleanFields = (types) => {
  return getFieldsByType(types, 'boolean').length > 0;
};

export default detectDataTypes;
