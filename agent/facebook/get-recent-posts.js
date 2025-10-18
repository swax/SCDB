#!/usr/bin/env node

const https = require('https');
const { URLSearchParams } = require('url');

// Load environment variables from .env.local file
require('dotenv').config({ path: '.env.local' });

const APP_ID = process.env.FACEBOOK_APP_ID;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const FACEBOOK_PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

const GRAPH_HOST = 'graph.facebook.com';
const GRAPH_VERSION = 'v23.0';
const DEFAULT_FIELDS = [
    'message',
    'created_time',
    'attachments{unshimmed_url,url}'
].join(',');

const DEFAULT_LIMIT = 10;
const MAX_PAGE_LIMIT = 50;

const USAGE = [
    'Usage: node agent/facebook/get-recent-posts.js [--limit N] [--json]',
    '',
    'Options:',
    `  --limit N   Maximum number of recent posts to retrieve (default: ${DEFAULT_LIMIT})`,
    '  --json      Print raw JSON array instead of formatted output'
].join('\n');

function printUsageAndExit() {
    console.error(USAGE);
    process.exit(1);
}

function parseLimit(value) {
    if (value === undefined) {
        return undefined;
    }

    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
        console.error('Error: limit must be a positive integer.');
        printUsageAndExit();
    }

    return parsed;
}

function parseArgs(argv) {
    const options = {
        limit: DEFAULT_LIMIT,
        json: false
    };

    for (let i = 2; i < argv.length; i += 1) {
        const arg = argv[i];

        if (arg === '--limit') {
            const next = argv[++i];
            if (next === undefined) {
                console.error('Error: --limit requires a numeric value.');
                printUsageAndExit();
            }
            const parsed = parseLimit(next);
            if (parsed !== undefined) {
                options.limit = parsed;
            }
        } else if (arg.startsWith('--limit=')) {
            const parsed = parseLimit(arg.split('=')[1]);
            if (parsed !== undefined) {
                options.limit = parsed;
            }
        } else if (arg === '--json') {
            options.json = true;
        } else if (arg === '--help' || arg === '-h') {
            printUsageAndExit();
        } else {
            console.error(`Error: Unknown argument "${arg}".`);
            printUsageAndExit();
        }
    }

    return options;
}

function ensureEnvironment() {
    if (!FACEBOOK_PAGE_ID) {
        console.error('Error: FACEBOOK_PAGE_ID environment variable is required');
        process.exit(1);
    }

    if (!FACEBOOK_PAGE_ACCESS_TOKEN) {
        console.error('Error: FACEBOOK_PAGE_ACCESS_TOKEN environment variable is required');
        process.exit(1);
    }
}

function graphRequest({ method = 'GET', path, body, headers = {} }) {
    return new Promise((resolve, reject) => {
        let requestPath = path;
        let hostname = GRAPH_HOST;
        let port = 443;

        if (path.startsWith('https://') || path.startsWith('http://')) {
            const url = new URL(path);
            hostname = url.hostname;
            port = url.port ? Number.parseInt(url.port, 10) : 443;
            requestPath = url.pathname + url.search;
        }

        const options = {
            hostname,
            port,
            method,
            path: requestPath,
            headers
        };

        const req = https.request(options, (res) => {
            let rawData = '';

            res.on('data', (chunk) => {
                rawData += chunk;
            });

            res.on('end', () => {
                let parsed;
                try {
                    parsed = rawData ? JSON.parse(rawData) : {};
                } catch (error) {
                    const parseError = new Error(`Unable to parse response JSON: ${error.message}`);
                    parseError.statusCode = res.statusCode;
                    parseError.raw = rawData;
                    return reject(parseError);
                }

                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(parsed);
                } else {
                    const err = new Error(`Facebook API error ${res.statusCode}`);
                    err.statusCode = res.statusCode;
                    err.response = parsed;
                    reject(err);
                }
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(body);
        }

        req.end();
    });
}

function buildRecentPostsPath({ afterCursor, limit }) {
    const params = new URLSearchParams({
        access_token: FACEBOOK_PAGE_ACCESS_TOKEN,
        fields: DEFAULT_FIELDS,
        limit: String(limit)
    });

    if (afterCursor) {
        params.append('after', afterCursor);
    }

    return `/${GRAPH_VERSION}/${FACEBOOK_PAGE_ID}/posts?${params.toString()}`;
}

async function fetchRecentPosts({ limit }) {
    const items = [];
    let remaining = limit;
    let afterCursor;
    let pageIndex = 0;

    while (remaining > 0) {
        pageIndex += 1;
        const pageLimit = Math.min(remaining, MAX_PAGE_LIMIT);
        const path = buildRecentPostsPath({ afterCursor, limit: pageLimit });
        const response = await graphRequest({ path });
        const data = Array.isArray(response.data) ? response.data : [];

        for (const post of data) {
            items.push(post);
            remaining -= 1;
            if (remaining === 0) {
                break;
            }
        }

        const nextCursor = response?.paging?.cursors?.after;
        const hasMore = Boolean(nextCursor) && data.length > 0;

        if (remaining === 0 || !hasMore) {
            break;
        }

        afterCursor = nextCursor;

        // Guard against unexpected loops if the API keeps returning the same cursor.
        if (pageIndex > 1000) {
            throw new Error('Aborting pagination: too many pages fetched without completion.');
        }
    }

    return items;
}

function formatDateTime(value) {
    if (!value) {
        return 'Unknown';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'Unknown';
    }

    return date.toLocaleString();
}

function renderPosts(posts) {
    if (!posts.length) {
        console.log('No recent posts found.');
        return;
    }

    console.log(`Found ${posts.length} recent post(s):`);

    for (const post of posts) {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        if (post.message) {
            console.log('Post:');
            console.log(post.message);
        } else {
            console.log('Message: (none)');
        }

        const attachment = post.attachments?.data?.[0];
        const link = attachment?.unshimmed_url || attachment?.url;
        console.log('Link:', link || '(none)');

        console.log('Created:', formatDateTime(post.created_time));
    }

    console.log('\nDone.');
}

function formatExpiry(debugData = {}, fallbackExpiresIn) {
    const { expires_at: expiresAtSeconds, expires_in: expiresInSeconds } = debugData;

    if (expiresAtSeconds === 0) {
        return 'Never (expires_at=0)';
    }

    const now = Date.now();
    let expiresAt;

    if (expiresAtSeconds) {
        expiresAt = new Date(expiresAtSeconds * 1000);
    } else if (typeof expiresInSeconds === 'number') {
        expiresAt = new Date(now + expiresInSeconds * 1000);
    } else if (typeof fallbackExpiresIn === 'number') {
        expiresAt = new Date(now + fallbackExpiresIn * 1000);
    }

    if (!expiresAt) {
        return 'Unknown';
    }

    const diffMs = expiresAt.getTime() - now;
    const days = diffMs / (1000 * 60 * 60 * 24);

    if (diffMs <= 0) {
        return `${expiresAt.toISOString()} (expired)`;
    }

    return `${expiresAt.toISOString()} (~${days.toFixed(1)} days remaining)`;
}

async function debugToken(token) {
    if (!APP_ID || !APP_SECRET) {
        return null;
    }

    const appAccessToken = `${APP_ID}|${APP_SECRET}`;
    const params = new URLSearchParams({
        input_token: token,
        access_token: appAccessToken
    });

    const path = `/${GRAPH_VERSION}/debug_token?${params.toString()}`;
    return graphRequest({ path });
}

async function main() {
    ensureEnvironment();
    const options = parseArgs(process.argv);

    try {
        console.log('🔐 Using page access token from environment');

        if (APP_ID && APP_SECRET) {
            try {
                const debug = await debugToken(FACEBOOK_PAGE_ACCESS_TOKEN);
                if (debug) {
                    console.log('⏱️ Page token expires:', formatExpiry(debug.data));
                }
            } catch (debugError) {
                console.error('⚠️ Unable to determine page token expiry:', debugError.message);
            }
        } else {
            console.log('ℹ️ Provide FACEBOOK_APP_ID and FACEBOOK_APP_SECRET to print token expiry info.');
        }

        console.log('\n📥 Fetching recent posts...');
        const posts = await fetchRecentPosts({ limit: options.limit });

        if (options.json) {
            console.log(JSON.stringify(posts, null, 2));
            return;
        }

        renderPosts(posts);
    } catch (error) {
        console.error('\n❌ Failed to fetch recent posts.');
        if (error.response) {
            console.error('Response:', JSON.stringify(error.response, null, 2));
        } else if (error.raw) {
            console.error('Raw response:', error.raw);
        } else {
            console.error('Error:', error.message);
        }
        process.exit(1);
    }
}

main();
