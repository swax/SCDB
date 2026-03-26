const { execSync } = require("child_process");
const fs = require("fs");

// Parse args
const args = process.argv.slice(2);
let videoUrl = null;
let numComments = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--comments") {
    numComments = parseInt(args[++i], 10);
    if (isNaN(numComments) || numComments < 1) {
      console.error("--comments requires a positive number");
      process.exit(1);
    }
  } else if (!videoUrl) {
    videoUrl = args[i];
  }
}

if (!videoUrl) {
  console.error(
    "Usage: node operations/youtube/video-summary.js <video_url> [--comments <num>]",
  );
  process.exit(1);
}

console.log(`Fetching video info from ${videoUrl}...`);

try {
  // Run yt-dlp to download video info (and optionally comments)
  let command = `yt-dlp --skip-download --write-info-json`;
  if (numComments) {
    console.log(`Including top ${numComments} comments...`);
    command += ` --write-comments --extractor-args "youtube:comment_sort=top;max_comments=${numComments}"`;
  }
  command += ` "${videoUrl}"`;
  execSync(command, { stdio: "inherit" });

  // Find the most recently created info.json file
  const files = fs
    .readdirSync(".")
    .filter((f) => f.endsWith(".info.json"))
    .map((f) => ({ name: f, time: fs.statSync(f).mtime.getTime() }))
    .sort((a, b) => b.time - a.time);

  if (files.length === 0) {
    console.error("Could not find info.json file");
    process.exit(1);
  }

  const infoFile = files[0].name;
  console.log(`\nReading data from ${infoFile}...`);

  // Read and parse the JSON file
  const data = JSON.parse(fs.readFileSync(infoFile, "utf8"));

  // Delete the info.json file to keep things clean
  fs.unlinkSync(infoFile);
  console.log(`Deleted ${infoFile}`);

  // Display metadata
  console.log("\n========== VIDEO METADATA ==========");
  console.log(`Title: ${data.title || "N/A"}`);
  console.log(`Channel: ${data.channel || "N/A"}`);
  console.log(`Upload Date: ${data.upload_date || "N/A"}`);
  console.log(`Views: ${data.view_count || "N/A"}`);
  console.log(`Likes: ${data.like_count || "N/A"}`);
  console.log(`Duration: ${data.duration || "N/A"} seconds`);
  console.log(`\nDescription:\n${data.description || "N/A"}`);

  // Display comments
  if (!data.comments || data.comments.length === 0) {
    console.log("\nNo comments found");
  } else {
    console.log(`\n========== TOP ${data.comments.length} COMMENTS ==========`);
    data.comments.forEach((c, i) => {
      console.log(`\n[${i + 1}] ${c.author} (${c.like_count || 0} likes):`);
      console.log(`    ${c.text}`);
    });
  }
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
}
