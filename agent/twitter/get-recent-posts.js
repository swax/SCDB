#!/usr/bin/env node

const https = require('https');
const crypto = require('crypto');
const { URL, URLSearchParams } = require('url');

// Load environment variables from .env.local file
require('dotenv').config({ path: '.env.local' });

const TWITTER_CONSUMER_KEY =
    process.env.TWITTER_API_KEY ||
    process.env.TWITTER_CONSUMER_KEY ||
    process.env.TWITTER_CLIENT_ID;
const TWITTER_CONSUMER_SECRET =
    process.env.TWITTER_API_SECRET ||
    process.env.TWITTER_CONSUMER_SECRET ||
    process.env.TWITTER_CLIENT_SECRET;
const TWITTER_ACCESS_TOKEN =
    process.env.TWITTER_ACCESS_TOKEN || process.env.TWITTER_OAUTH_TOKEN;
const TWITTER_ACCESS_TOKEN_SECRET =
    process.env.TWITTER_ACCESS_TOKEN_SECRET ||
    process.env.TWITTER_OAUTH_TOKEN_SECRET;
const TWITTER_HANDLE =
    process.env.TWITTER_HANDLE ||
    process.env.TWITTER_USERNAME ||
    process.env.TWITTER_SCREEN_NAME;
const TWITTER_USER_ID =
    process.env.TWITTER_USER_ID ||
    process.env.TWITTER_ACCOUNT_ID ||
    process.env.TWITTER_PROFILE_ID;

const API_HOST = 'api.twitter.com';
const API_BASE_URL = 'https://api.twitter.com';
const USER_AGENT = 'SketchTV Twitter Recent Posts Script/1.0';

const DEFAULT_LIMIT = 10;
const MAX_PAGE_LIMIT = 100;
const MIN_PAGE_LIMIT = 5;

const DEFAULT_TWEET_FIELDS = [
    'created_at',
    'public_metrics',
    'entities',
    'possibly_sensitive'
].join(',');

const USAGE = [
    'Usage: node agent/twitter/get-recent-posts.js <handle> [--limit N] [--json]',
    '',
    'Options:',
    `  --limit N   Maximum number of recent tweets to retrieve (default: ${DEFAULT_LIMIT})`,
    '  --json      Print raw JSON array instead of formatted output',
    '',
    'Arguments:',
    '  <handle>    Twitter handle (with or without leading @)'
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
        json: false,
        handle: undefined
    };
    const positional = [];

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
        } else if (arg.startsWith('-')) {
            console.error(`Error: Unknown argument "${arg}".`);
            printUsageAndExit();
        } else {
            positional.push(arg);
        }
    }

    if (positional.length > 1) {
        console.error('Error: Too many positional arguments provided.');
        printUsageAndExit();
    }

    options.handle = positional[0];
    return options;
}

function ensureEnvironment({ handle }) {
    if (!TWITTER_CONSUMER_KEY) {
        console.error(
            'Error: TWITTER_API_KEY (or TWITTER_CONSUMER_KEY / TWITTER_CLIENT_ID) is required'
        );
        process.exit(1);
    }

    if (!TWITTER_CONSUMER_SECRET) {
        console.error(
            'Error: TWITTER_API_SECRET (or TWITTER_CONSUMER_SECRET / TWITTER_CLIENT_SECRET) is required'
        );
        process.exit(1);
    }

    if (!TWITTER_ACCESS_TOKEN) {
        console.error(
            'Error: TWITTER_ACCESS_TOKEN (or TWITTER_OAUTH_TOKEN) is required'
        );
        process.exit(1);
    }

    if (!TWITTER_ACCESS_TOKEN_SECRET) {
        console.error(
            'Error: TWITTER_ACCESS_TOKEN_SECRET (or TWITTER_OAUTH_TOKEN_SECRET) is required'
        );
        process.exit(1);
    }

    if (!TWITTER_USER_ID && !handle && !TWITTER_HANDLE) {
        console.error('Error: Provide a Twitter handle via CLI or set TWITTER_HANDLE.');
        process.exit(1);
    }
}

function percentEncode(str) {
    return encodeURIComponent(str)
        .replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

function serializeParams(params) {
    const flattened = [];

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) {
            return;
        }

        if (Array.isArray(value)) {
            value.forEach((entry) => flattened.push([key, String(entry)]));
        } else {
            flattened.push([key, String(value)]);
        }
    });

    flattened.sort((a, b) => {
        if (a[0] === b[0]) {
            return a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0;
        }

        return a[0] < b[0] ? -1 : 1;
    });

    return flattened
        .map(([key, value]) => `${percentEncode(String(key))}=${percentEncode(String(value))}`)
        .join('&');
}

function createOAuthHeader(method, requestUrl, consumerKey, consumerSecret, token, tokenSecret) {
    const nonce = crypto.randomBytes(16).toString('hex');
    const timestamp = Math.floor(Date.now() / 1000);

    const oauthParams = {
        oauth_consumer_key: consumerKey,
        oauth_nonce: nonce,
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: timestamp,
        oauth_token: token,
        oauth_version: '1.0'
    };

    const urlObject = new URL(requestUrl);

    const signatureParams = {
        ...oauthParams
    };

    for (const [key, value] of urlObject.searchParams.entries()) {
        signatureParams[key] = signatureParams[key]
            ? [].concat(signatureParams[key], value)
            : value;
    }

    const baseString = [
        method.toUpperCase(),
        percentEncode(`${urlObject.origin}${urlObject.pathname}`),
        percentEncode(serializeParams(signatureParams))
    ].join('&');

    const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;
    const signature = crypto
        .createHmac('sha1', signingKey)
        .update(baseString)
        .digest('base64');

    const headerParams = {
        ...oauthParams,
        oauth_signature: signature
    };

    const headerString =
        'OAuth ' +
        Object.keys(headerParams)
            .sort()
            .map(
                (key) =>
                    `${percentEncode(key)}="${percentEncode(String(headerParams[key]))}"`
            )
            .join(', ');

    return headerString;
}

function twitterRequest({ method = 'GET', path, body }) {
    return new Promise((resolve, reject) => {
        const url = `${API_BASE_URL}${path}`;
        const headers = {
            Authorization: createOAuthHeader(
                method,
                url,
                TWITTER_CONSUMER_KEY,
                TWITTER_CONSUMER_SECRET,
                TWITTER_ACCESS_TOKEN,
                TWITTER_ACCESS_TOKEN_SECRET
            ),
            Accept: 'application/json',
            'User-Agent': USER_AGENT
        };

        let requestBody;

        if (body) {
            requestBody = JSON.stringify(body);
            headers['Content-Type'] = 'application/json';
            headers['Content-Length'] = Buffer.byteLength(requestBody);
        }

        const options = {
            hostname: API_HOST,
            port: 443,
            method,
            path,
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
                    const err = new Error(`Twitter API error ${res.statusCode}`);
                    err.statusCode = res.statusCode;
                    err.response = parsed;
                    reject(err);
                }
            });
        });

        req.on('error', reject);

        if (requestBody) {
            req.write(requestBody);
        }

        req.end();
    });
}

function sanitizeHandle(handle) {
    if (!handle) {
        return undefined;
    }
    return handle.replace(/^@/, '').trim();
}

async function resolveUser({ handle }) {
    if (TWITTER_USER_ID) {
        return {
            id: TWITTER_USER_ID,
            username: sanitizeHandle(handle || TWITTER_HANDLE)
        };
    }

    const username = sanitizeHandle(handle || TWITTER_HANDLE);
    if (!username) {
        throw new Error('Unable to resolve Twitter user: handle not provided.');
    }

    const path = `/2/users/by/username/${encodeURIComponent(username)}`;
    const response = await twitterRequest({ path });
    const userData = response?.data;

    if (!userData?.id) {
        const err = new Error('Unable to resolve Twitter user ID');
        err.response = response;
        throw err;
    }

    return {
        id: userData.id,
        username: userData.username || username
    };
}

function buildTweetsPath({ userId, paginationToken, limit }) {
    const params = new URLSearchParams({
        max_results: String(Math.max(Math.min(limit, MAX_PAGE_LIMIT), MIN_PAGE_LIMIT)),
        'tweet.fields': DEFAULT_TWEET_FIELDS,
        exclude: 'retweets,replies'
    });

    if (paginationToken) {
        params.set('pagination_token', paginationToken);
    }

    return `/2/users/${userId}/tweets?${params.toString()}`;
}

async function fetchRecentTweets({ userId, limit }) {
    const items = [];
    let remaining = limit;
    let paginationToken;
    let pageIndex = 0;

    while (remaining > 0) {
        pageIndex += 1;
        const pageLimit = Math.min(remaining, MAX_PAGE_LIMIT);
        const path = buildTweetsPath({ userId, paginationToken, limit: pageLimit });
        const response = await twitterRequest({ path });
        const data = Array.isArray(response.data) ? response.data : [];

        for (const tweet of data) {
            items.push(tweet);
            remaining -= 1;
            if (remaining === 0) {
                break;
            }
        }

        const nextToken = response?.meta?.next_token;
        const hasMore = Boolean(nextToken) && data.length > 0;

        if (remaining === 0 || !hasMore) {
            break;
        }

        paginationToken = nextToken;

        // Guard against unexpected loops if the API keeps returning the same pagination token.
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

function resolveTweetLink({ tweetId, username }) {
    if (username) {
        return `https://x.com/${username}/status/${tweetId}`;
    }
    return `https://x.com/i/web/status/${tweetId}`;
}

function extractPrimaryUrl(tweet) {
    const urls = tweet?.entities?.urls;
    if (!Array.isArray(urls) || urls.length === 0) {
        return null;
    }
    return urls[0]?.expanded_url || urls[0]?.url || null;
}

function renderTweets(tweets, { username }) {
    if (!tweets.length) {
        console.log('No recent tweets found.');
        return;
    }

    console.log(`Found ${tweets.length} recent tweet(s):`);

    for (const tweet of tweets) {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Tweet:');
        console.log(tweet.text || '(no text)');

        const url = extractPrimaryUrl(tweet);
        if (url) {
            console.log('Linked URL:', url);
        }

        const metrics = tweet.public_metrics || {};
        console.log('Metrics:', [
            `likes=${metrics.like_count ?? 0}`,
            `retweets=${metrics.retweet_count ?? 0}`,
            `replies=${metrics.reply_count ?? 0}`,
            `quotes=${metrics.quote_count ?? 0}`
        ].join(', '));

        console.log('Created:', formatDateTime(tweet.created_at));
        console.log('Tweet URL:', resolveTweetLink({ tweetId: tweet.id, username }));
        if (tweet.possibly_sensitive) {
            console.log('⚠️ Marked as possibly sensitive.');
        }
    }

    console.log('\nDone.');
}

async function main() {
    const options = parseArgs(process.argv);
    ensureEnvironment(options);

    try {
        console.log('🔐 Using Twitter user access token from environment');

        const user = await resolveUser({ handle: options.handle });
        if (user.username) {
            console.log(`👤 Twitter user: @${user.username}`);
        } else {
            console.log(`👤 Twitter user ID: ${user.id}`);
        }

        console.log('\n📥 Fetching recent tweets...');
        const tweets = await fetchRecentTweets({ userId: user.id, limit: options.limit });

        if (options.json) {
            console.log(JSON.stringify(tweets, null, 2));
            return;
        }

        renderTweets(tweets, { username: user.username });
    } catch (error) {
        console.error('\n❌ Failed to fetch recent tweets.');
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
