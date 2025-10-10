#!/usr/bin/env node

const https = require('https');
const querystring = require('querystring');
const { URLSearchParams } = require('url');

// Load environment variables from .env.local file
require('dotenv').config({ path: '.env.local' });

const APP_ID = process.env.FACEBOOK_APP_ID;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const FACEBOOK_PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

const GRAPH_HOST = 'graph.facebook.com';
const GRAPH_VERSION = 'v18.0';

// Validate CLI arguments
if (process.argv.length < 4) {
    console.error('Usage: node facebook-post.js "Post text" "Page URL"');
    console.error('Example: node facebook-post.js "Check out this sketch!" "https://sketchtv.lol/sketch/123"');
    process.exit(1);
}

// Validate environment variables
if (!FACEBOOK_PAGE_ID) {
    console.error('Error: FACEBOOK_PAGE_ID environment variable is required');
    process.exit(1);
}

if (!FACEBOOK_PAGE_ACCESS_TOKEN) {
    console.error('Error: FACEBOOK_PAGE_ACCESS_TOKEN environment variable is required');
    process.exit(1);
}

const postText = process.argv[2];
const pageUrl = process.argv[3];
const message = `${postText}\n\n${pageUrl}`;

function graphRequest({ method = 'GET', path, body, headers = {} }) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: GRAPH_HOST,
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
        throw new Error('FACEBOOK_APP_ID and FACEBOOK_APP_SECRET are required to debug tokens');
    }

    const APP_ACCESS_TOKEN = `${APP_ID}|${APP_SECRET}`;
    const params = new URLSearchParams({
        input_token: token,
        access_token: APP_ACCESS_TOKEN
    });

    const path = `/${GRAPH_VERSION}/debug_token?${params.toString()}`;
    return graphRequest({ path });
}

async function postToPage(accessToken, body) {
    const postData = querystring.stringify({
        message: body,
        access_token: accessToken
    });

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
    };

    const path = `/${GRAPH_VERSION}/${FACEBOOK_PAGE_ID}/feed`;
    return graphRequest({ method: 'POST', path, body: postData, headers });
}

async function main() {
    try {
        console.log('🔐 Using page access token from environment');

        if (APP_ID && APP_SECRET) {
            try {
                const pageDebug = await debugToken(FACEBOOK_PAGE_ACCESS_TOKEN);
                console.log('⏱️ Page token expires:', formatExpiry(pageDebug.data));
            } catch (debugError) {
                console.error('⚠️ Unable to determine page token expiry:', debugError.message);
            }
        } else {
            console.log('ℹ️ Provide FACEBOOK_APP_ID and FACEBOOK_APP_SECRET to print expiry info.');
        }

        console.log('\n📤 Posting to Facebook...');
        console.log('Message:', message);

        const response = await postToPage(FACEBOOK_PAGE_ACCESS_TOKEN, message);

        if (response && response.id) {
            console.log('\n✅ Post published successfully!');
            console.log('Post ID:', response.id);
            console.log('Post URL: https://facebook.com/' + response.id);
        } else {
            console.error('❌ Unexpected response from Facebook.');
            console.error(JSON.stringify(response, null, 2));
            process.exit(1);
        }
    } catch (error) {
        console.error('\n❌ Failed to publish post.');
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
