import { Database } from 'bun:sqlite';

const db = new Database('forensilock.db');
const latest = db.query("SELECT * FROM evidence ORDER BY id DESC LIMIT 1").get() as any;

if (!latest) {
  console.log("No evidence found.");
  process.exit(1);
}
console.log(`Checking Evidence #${latest.id}`);

if (latest.description_enc.endsWith("AAAAAAA")) {
    const cleanData = latest.description_enc.slice(0, -7);
    db.run("UPDATE evidence SET description_enc = ? WHERE id = ?", [cleanData, latest.id]);

    console.log(`Malicious string removed.`);
    console.log(`Integrity verification should now PASS.`);
} else {
    console.log("No tampering detected on the latest record.");
}