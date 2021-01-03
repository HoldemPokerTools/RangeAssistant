const rankCodes = {
  '2': 0,
  '3': 1,
  '4': 2,
  '5': 3,
  '6': 4,
  '7': 5,
  '8': 6,
  '9': 7,
  'T': 8,
  'J': 9,
  'Q': 10,
  'K': 11,
  'A': 12
}

const ranks = Object.keys(rankCodes).reverse();
const axArray = ranks.slice(1);
const kxArray = axArray.slice(1);
const qxArray = kxArray.slice(1);
const jxArray = qxArray.slice(1);
const txArray = jxArray.slice(1);
const _9xArray = txArray.slice(1);
const _8xArray = _9xArray.slice(1);

// Create hash with keys as card ranks, and values as their codes
const toHash = (highRank, arr) => {
  return arr.reduce((acc, next, idx) => Object.assign(acc, {[highRank + next]: idx}), {_size: arr.length});
}

const ax = toHash('A', axArray)
const kx = toHash('K', kxArray)
const qx = toHash('Q', qxArray)
const jx = toHash('J', jxArray)
const tx = toHash('T', txArray)
const _9x = toHash('9', _9xArray)
const _8x = toHash('8', _8xArray)

// reduce the array down to groups of consecutive items in i.e. no nulls between them
const comboGroupReducer = (acc, next) => {
  const idx = acc.length - 1;
  next === null
    ? acc.push([])
    : acc[idx].push(next)
  return acc;
};

const processCombos = (hash, combos) => {
  // Given a hash e.g. Ax and combos e.g. [A2, A3, K2...], generate groups for combos which are in that hash
  return Object
    .keys(hash)
    // create an array of combos where combo at an index is the key from the given hash whose value is === index if the key is in
    // the given combos (otherwise null). e.g. for Ax, the value at index 0, will be A if AQ is in combos else null
    .reduce((acc, k) => {
      acc[hash[k]] = combos.has(k) ? k : null;
      return acc;
    }, new Array(hash._size))
    .reduce(comboGroupReducer, [[]])
    .filter(i => i.length > 0);
}

const groupifyPairs = (pairs) => {
  const containedCodes = new Array(13).fill(null);

  pairs.forEach(p => {
    const code = rankCodes[p[0]]
    containedCodes[code] = p
  });

  return containedCodes
    .reverse()
    .reduce(comboGroupReducer, [[]])
    .filter(i => i.length > 0);
}

export const shortenPairs = (pairs) => {
  const toShortNotation = (group) => {
    const first = group[0]
    if (group.length === 1) return first
    const last = group[group.length - 1]
    return group[0] === 'AA' ? `${last}+` : `${first}-${last}`
  }

  const groups = groupifyPairs(pairs)
  return groups.map(toShortNotation)
}

export const shortenNonPairs = (combos, suffix) => {
  const toShortNotation = suffix => (hash, group) => {
    const first = group[0]
    if (group.length === 1) return first
    const last = group[group.length - 1]
    return hash[first] === 0
      ? `${last}${suffix}+`
      : `${first}${suffix}-${last}${suffix}`;
  }
  // Detect connections in descending order
  // Only accept all groups that are at least 3 long
  const orderedHashes = [ ax, kx, qx, jx, tx, _9x, _8x ]
  let remainingCombos = new Set(combos)
  let results = orderedHashes
    .reduce((acc, hash) => {
      // Group combos according to ordered hashes e.g. group all Ax, Kx and ensure all groups have at least 3 combos
      const groups = processCombos(hash, remainingCombos).filter(i => i.length >= 3)
      // If a group is valid, remove it's combos from the remaining combos
      groups.flat().forEach(i => {
        remainingCombos.delete(i)
      });
      // Convert groups to short notation
      const notations = groups.map(x => toShortNotation(suffix)(hash, x))
      return acc.concat(notations)
    }, []);

  return results.concat(Array.from(remainingCombos).map(x => x + suffix))
}

