import PouchDB from "pouchdb";
const db = new PouchDB('ranges');

export const getRanges = async () => (await db.allDocs({include_docs: true})).rows.map(row => row.doc);
export const storeRange = async (range) => {
  try {
    return await db.get(range._id);
  } catch (err) {
    if (err.status !== 404) {
      throw err
    }
    return await db.put(range);
  }
}
export const deleteRange = async (rangeId) => {
  var doc = await db.get(rangeId);
  return await db.remove(doc);
}
export const registerListener = (cb) => {
  db.changes({live: true, since: 'now', include_docs: true}).on('change', cb);
}
export const deleteAllRanges = async () => {
  const allDocs = await db.allDocs()
  allDocs.rows.forEach(async (row) => db.remove(row.id, row.value.rev));
}