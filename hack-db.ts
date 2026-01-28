import { Database } from 'bun:sqlite';

const db = new Database('forensilock.db');

// 1. Fetch the latest evidence log
const latest = db.query("SELECT * FROM evidence ORDER BY id DESC LIMIT 1").get() as any;

if (!latest) {
  console.log("No evidence found to tamper with!");
  process.exit(1);
}

console.log(`Changing evidence #${latest.id}`);
console.log(`Original Cipher: ${latest.description_enc.substring(0, 20)}...`);

// 2. TAMPERING: Change the encrypted data slightly
// We append a random string to the encrypted text.
// This simulates someone corrupting the file or trying to edit it manually.
const tamperedData = latest.description_enc + "_HACKED";

db.run("UPDATE evidence SET description_enc = ? WHERE id = ?", [tamperedData, latest.id]);

console.log(`Altered cipher.`);
console.log(`The evidence chain is now BROKEN.`);