export function isNotNull(value) {
  if (Array.isArray(value)) {
    return true
  }
  if (value === 0 || value === '0') {
    return true
  }
  return !(
    value === '' ||
    value === null ||
    typeof value === 'undefined' ||
    value === 'null' ||
    value === 'undefined' ||
    String(value).trim() === '' ||
    String(value).trim() === 'undefined'
  )
}
