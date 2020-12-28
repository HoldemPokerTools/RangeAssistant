export const filterUndefinedKeys = (obj) => Object.keys(obj).reduce((acc, key) => {
  if (obj[key] === undefined || (Array.isArray(obj[key]) && obj[key].every(v => v === 0))) return acc;
  return {...acc, [key]: obj[key]};
}, {});
