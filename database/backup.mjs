import { exec } from "child_process";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const pgUri = process.env.DATABASE_URL;
const backupDir = "./database/backups";
const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

// TODO: Move username, mod notes, etc.. to profile table and have all foreign keys point to that table
// TODO: Move account, session, and user tables to 'sec' schema

const publicBackup = false;
const pubCmd = publicBackup ? "-T account -T session -T user" : ""; // Leave out account, session and user tables
const pubSuffix = publicBackup ? "public" : "sensitive";
const filename = `${backupDir}/backup-${date}-${pubSuffix}.sql`;

// Dump the public schema
const command = `pg_dump -n public ${pubCmd} --data-only ${pgUri} > ${filename}`;

console.log("Starting backup...");

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Backup saved to ${filename}`);
});
