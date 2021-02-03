import PouchDB from "pouchdb";
const db = new PouchDB("ranges");

export const getRanges = () => db
  .allDocs({ include_docs: true })
  .then(data => data.rows.map((row) => row.doc));

export const getRange = (docId) => db.get(docId);

export const updateRange = (rangeId, updatedRange) => {
  return db.get(rangeId)
    .then(doc => Object.assign(doc, updatedRange))
    .then(db.put);
};

export const createRange = (range) => {
  return db
    .post(range)
    .then(res => db.get(res.id));
};

export const deleteRange = async (rangeId) => {
  return db.get(rangeId)
    .then(db.remove);
};

export const registerListener = (cb) => {
  const listener = db.changes({ live: true, since: "now", include_docs: true });
  listener.on("change", cb);
  return listener;
};

export const deleteAllRanges = async () => {
  return db.allDocs({include_docs: true}).then(allDocs => {
    return allDocs.rows.map(row => ({_id: row.id, _rev: row.doc._rev, _deleted: true}));
  }).then(db.bulkDocs);
};
