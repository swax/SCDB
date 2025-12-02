#!/usr/bin/env tsx

/**
 * Sketch Details Exporter
 *
 * This script fetches detailed information about a sketch from the database
 * and exports it to a text file for use with AI agents.
 *
 * Usage: npx tsx operations/sketchtvlol/get-sketch-details.mjs <sketch_id> [--with-folder]
 *
 * Requirements:
 * - Node.js 18 or higher
 * - tsx (installed as dev dependency)
 * - .env.local file with database configuration
 *
 * @example
 * npx tsx operations/sketchtvlol/get-sketch-details.mjs 123
 * npx tsx operations/sketchtvlol/get-sketch-details.mjs 123 --with-folder
 */

import prismaExports from "../../database/generated/client.ts";
const { PrismaClient } = prismaExports;
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables from .env.local file
dotenv.config({ path: ".env.local" });

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check Node.js version
const nodeVersion = parseInt(process.version.slice(1));
if (nodeVersion < 18) {
  console.error("Error: This script requires Node.js 18 or higher");
  process.exit(1);
}

// Function to display usage
function usage() {
  console.log(
    "Usage: npx tsx operations/sketchtvlol/get-sketch-details.mjs <sketch_id> [--with-folder]",
  );
  console.log(
    "Example: npx tsx operations/sketchtvlol/get-sketch-details.mjs 123",
  );
  console.log(
    "Example: npx tsx operations/sketchtvlol/get-sketch-details.mjs 123 --with-folder",
  );
  console.log("");
  console.log("Options:");
  console.log(
    "  --with-folder    Create folder named <sketch_id>_<sketch_url_slug> and save database.txt inside",
  );
  console.log("");
  console.log(
    "This script fetches sketch details from the database and saves them to database.txt",
  );
  console.log("");
  console.log(
    "Note: This script uses tsx to handle TypeScript imports from Prisma 7.",
  );
  console.log(
    '      Make sure you have run "npm install" to install tsx as a dev dependency.',
  );
  process.exit(1);
}

// Function to format date
function formatDate(date) {
  if (!date) return "N/A";
  return date.toISOString().split("T")[0];
}

// Function to format array of URLs
function formatUrls(urls) {
  if (!urls || urls.length === 0) return "None";
  return urls.join(", ");
}

// Function to sanitize folder name
function sanitizeFolderName(name) {
  return name
    .replace(/[^a-zA-Z0-9\s\-_]/g, "") // Remove special characters except spaces, hyphens, underscores
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .trim();
}

// Main function to get sketch details
async function getSketchDetails(sketchId, withFolder = false) {
  // Create the PostgreSQL adapter
  const adapter = new PrismaPg({
    connectionString:
      process.env.DATABASE_POOLED_URL || process.env.DATABASE_URL || "",
  });

  const prisma = new PrismaClient({ adapter });

  try {
    console.log(`Fetching details for sketch ID: ${sketchId}...`);

    // Fetch sketch with all related data
    const sketch = await prisma.sketch.findUnique({
      where: {
        id: parseInt(sketchId),
      },
      include: {
        show: true,
        season: true,
        episode: true,
        recurring_sketch: true,
        image: true,
        created_by: true,
        modified_by: true,
        sketch_casts: {
          include: {
            person: true,
            character: true,
            image: true,
          },
          orderBy: {
            sequence: "asc",
          },
        },
        sketch_credits: {
          include: {
            person: true,
          },
          orderBy: {
            sequence: "asc",
          },
        },
        sketch_tags: {
          include: {
            tag: {
              include: {
                category: true,
              },
            },
          },
          orderBy: {
            sequence: "asc",
          },
        },
        sketch_quotes: {
          orderBy: {
            sequence: "asc",
          },
        },
      },
    });

    if (!sketch) {
      throw new Error(`Sketch with ID ${sketchId} not found`);
    }

    // Build details output
    let details = "";

    details += "=".repeat(80) + "\n";
    details += `SKETCH DETAILS - ID: ${sketch.id}\n`;
    details += "=".repeat(80) + "\n\n";

    // Basic Information
    details += "--- BASIC INFORMATION ---\n";
    details += `Title: ${sketch.title}\n`;
    details += `URL Slug: ${sketch.url_slug}\n`;
    details += `Lookup Slug: ${sketch.lookup_slug}\n`;
    details += `Teaser: ${sketch.teaser || "N/A"}\n`;
    details += `Synopsis: ${sketch.synopsis || "N/A"}\n`;
    details += `Notes: ${sketch.notes || "N/A"}\n`;
    details += `Video URLs: ${formatUrls(sketch.video_urls)}\n`;
    details += `Link URLs: ${formatUrls(sketch.link_urls)}\n`;
    details += `Image ID: ${sketch.image_id}\n`;
    if (sketch.image) {
      details += `Image CDN Key: ${sketch.image.cdn_key}\n`;
    }
    details += `Created: ${formatDate(sketch.created_at)}\n`;
    details += `Modified: ${formatDate(sketch.modified_at)}\n\n`;

    // Show Information
    details += "--- SHOW INFORMATION ---\n";
    details += `Show: ${sketch.show.title} (ID: ${sketch.show_id})\n`;
    details += `Show URL Slug: ${sketch.show.url_slug}\n`;
    details += `Show Description: ${sketch.show.description || "N/A"}\n`;

    if (sketch.season) {
      details += `Season: ${sketch.season.number} (${sketch.season.year}) (ID: ${sketch.season_id})\n`;
      details += `Season URL Slug: ${sketch.season.url_slug}\n`;
      details += `Season Description: ${sketch.season.description || "N/A"}\n`;
    }

    if (sketch.episode) {
      details += `Episode: ${sketch.episode.number} (ID: ${sketch.episode_id})\n`;
      details += `Episode Title: ${sketch.episode.title || "N/A"}\n`;
      details += `Episode URL Slug: ${sketch.episode.url_slug}\n`;
      details += `Episode Air Date: ${formatDate(sketch.episode.air_date)}\n`;
      details += `Episode Description: ${sketch.episode.description || "N/A"}\n`;
    }

    if (sketch.recurring_sketch) {
      details += `Recurring Sketch: ${sketch.recurring_sketch.title} (ID: ${sketch.recurring_sketch_id})\n`;
      details += `Recurring Sketch URL Slug: ${sketch.recurring_sketch.url_slug}\n`;
      details += `Recurring Sketch Description: ${sketch.recurring_sketch.description || "N/A"}\n`;
    }

    details += "\n";

    // Cast Information
    if (sketch.sketch_casts.length > 0) {
      details += "--- CAST ---\n";
      sketch.sketch_casts.forEach((cast, index) => {
        details += `${index + 1}. `;
        if (cast.person) {
          details += `${cast.person.name} (Person ID: ${cast.person_id})`;
        } else {
          details += `Unknown Person (Person ID: ${cast.person_id})`;
        }

        if (cast.character_name || cast.character) {
          const characterName = cast.character_name || cast.character?.name;
          const characterId = cast.character_id
            ? ` (Character ID: ${cast.character_id})`
            : "";
          details += ` as ${characterName}${characterId}`;
        }

        details += ` - ${cast.role}`;
        if (cast.minor_role) details += " (Minor Role)";
        if (cast.image_id) details += ` (Image ID: ${cast.image_id})`;
        details += ` (Cast ID: ${cast.id})\n`;
      });
      details += "\n";
    }

    // Credits Information
    if (sketch.sketch_credits.length > 0) {
      details += "--- CREDITS ---\n";
      sketch.sketch_credits.forEach((credit, index) => {
        details += `${index + 1}. ${credit.person.name} - ${credit.role}`;
        if (credit.description) details += ` (${credit.description})`;
        details += ` (Person ID: ${credit.person_id}, Credit ID: ${credit.id})\n`;
      });
      details += "\n";
    }

    // Tags Information
    if (sketch.sketch_tags.length > 0) {
      details += "--- TAGS ---\n";
      sketch.sketch_tags.forEach((sketchTag, index) => {
        const tag = sketchTag.tag;
        details += `${index + 1}. ${tag.category.name}: ${tag.name}`;
        if (tag.description) details += ` - ${tag.description}`;
        details += ` (Tag ID: ${tag.id}, Category ID: ${tag.category_id}, Sketch Tag ID: ${sketchTag.id})\n`;
      });
      details += "\n";
    }

    // Quotes Information
    if (sketch.sketch_quotes.length > 0) {
      details += "--- QUOTES ---\n";
      sketch.sketch_quotes.forEach((quote, index) => {
        details += `${index + 1}. "${quote.quote}"\n`;
      });
      details += "\n";
    }

    // Write to file
    let outputPath;
    if (withFolder) {
      // Get year from season or show creation date as fallback
      const year =
        sketch.season?.year || new Date(sketch.created_at).getFullYear();

      // Create folder name: <sketch_id>_<sketch_url_slug>
      const folderName = `${sketch.id}_${sketch.url_slug}`;

      // Create the folder
      const folderPath = path.join(process.cwd(), folderName);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      outputPath = path.join(folderPath, "database.txt");
    } else {
      outputPath = path.join(process.cwd(), "database.txt");
    }
    fs.writeFileSync(outputPath, details, "utf8");

    console.log("✅ Sketch details fetched successfully!");
    console.log(`💾 Details saved to: ${outputPath}`);
    console.log(
      `📊 Found: ${sketch.sketch_casts.length} cast members, ${sketch.sketch_credits.length} credits, ${sketch.sketch_tags.length} tags, ${sketch.sketch_quotes.length} quotes`,
    );
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Check if we're running as a script
if (import.meta.url === `file://${process.argv[1]}`) {
  // Parse arguments
  const args = process.argv.slice(2);
  const withFolderIndex = args.indexOf("--with-folder");
  const withFolder = withFolderIndex !== -1;

  // Remove --with-folder from args
  if (withFolder) {
    args.splice(withFolderIndex, 1);
  }

  if (args.length !== 1) {
    usage();
  }

  const sketchId = args[0];

  // Validate sketch ID is a number
  if (!/^\d+$/.test(sketchId)) {
    console.error("Error: Sketch ID must be a number");
    process.exit(1);
  }

  getSketchDetails(sketchId, withFolder);
}

export { getSketchDetails };
