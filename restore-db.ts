import { Database } from 'bun:sqlite';

const db = new Database('forensilock.db');

// 1. Fetch the latest tampered evidence
const latest = db.query("SELECT * FROM evidence ORDER BY id DESC LIMIT 1").get() as any;

if (!latest) {
  console.log("No evidence found.");
  process.exit(1);
}

console.log(`Checking Evidence #${latest.id}`);

// 2. CHECK: Does it have the "_HACKED" tag?
if (latest.description_enc.endsWith("AAAAAAA")) {
    
    // 3. RESTORE: Remove the last 7 characters ("_HACKED")
    const cleanData = latest.description_enc.slice(0, -7);

    // execute the update
    db.run("UPDATE evidence SET description_enc = ? WHERE id = ?", [cleanData, latest.id]);

    console.log(`Malicious string removed.`);
    console.log(`Integrity verification should now PASS.`);

} else {
    console.log("No tampering detected on the latest record.");
}