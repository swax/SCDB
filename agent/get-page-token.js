#!/usr/bin/env node

/**
 * Facebook Page Token Retriever
 *
 * Usage: node get-page-token.js
 *
 * Required Environment Variables:
 * - FACEBOOK_APP_ID
 * - FACEBOOK_APP_SECRET
 * - FACEBOOK_USER_ACCESS_TOKEN (short-lived user token to exchange)
 */

const https = require('https');
const { URLSearchParams } = require('url');

// Load environment variables from .env.local file
require('dotenv').config({ path: '.env.local' });

const APP_ID = process.env.FACEBOOK_APP_ID;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const USER_ACCESS_TOKEN = process.env.FACEBOOK_USER_ACCESS_TOKEN;

if (!APP_ID || !APP_SECRET) {
    console.error('Error: FACEBOOK_APP_ID and FACEBOOK_APP_SECRET environment variables are required');
    process.exit(1);
}

if (!USER_ACCESS_TOKEN) {
    console.error('Error: FACEBOOK_USER_ACCESS_TOKEN environment variable is required');
    process.exit(1);
}

const GRAPH_HOST = 'graph.facebook.com';
const GRAPH_VERSION = 'v18.0';
const APP_ACCESS_TOKEN = `${APP_ID}|${APP_SECRET}`;

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

async function exchangeForLongLivedUserToken(shortLivedToken) {
    const params = new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: APP_ID,
        client_secret: APP_SECRET,
        fb_exchange_token: shortLivedToken
    });

    const path = `/${GRAPH_VERSION}/oauth/access_token?${params.toString()}`;
    return graphRequest({ path });
}

async function debugToken(token) {
    const params = new URLSearchParams({
        input_token: token,
        access_token: APP_ACCESS_TOKEN
    });

    const path = `/${GRAPH_VERSION}/debug_token?${params.toString()}`;
    return graphRequest({ path });
}

async function fetchManagedPages(userToken) {
    const params = new URLSearchParams({
        access_token: userToken,
        fields: 'access_token,name,id,category'
    });

    const path = `/${GRAPH_VERSION}/me/accounts?${params.toString()}`;
    return graphRequest({ path });
}

async function main() {
    try {
        console.log('♻️ Exchanging short-lived user token for a long-lived token...');
        const exchange = await exchangeForLongLivedUserToken(USER_ACCESS_TOKEN);

        const longLivedUserToken = exchange.access_token;

        console.log('\n🔐 Long-lived user token acquired:');
        console.log(longLivedUserToken);

        const userDebug = await debugToken(longLivedUserToken);
        console.log('⏱️ User token expires:', formatExpiry(userDebug.data, exchange.expires_in));

        console.log('\n📄 Fetching managed Pages using the long-lived user token...');
        const pagesResponse = await fetchManagedPages(longLivedUserToken);

        if (!pagesResponse.data || pagesResponse.data.length === 0) {
            console.log('No managed pages were returned. Check that the user token has the right permissions.');
            return;
        }

        console.log(`✅ Found ${pagesResponse.data.length} page(s):`);

        for (const page of pagesResponse.data) {
            console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`Page: ${page.name || 'Unnamed Page'}`);
            console.log(`ID: ${page.id}`);
            console.log(`Category: ${page.category || 'N/A'}`);

            if (!page.access_token) {
                console.log('No access token returned for this page. Ensure the user has manage permissions.');
                continue;
            }

            console.log('Access Token:', page.access_token);

            try {
                const pageDebug = await debugToken(page.access_token);
                console.log('⏱️ Page token expires:', formatExpiry(pageDebug.data));
            } catch (debugError) {
                console.error('⚠️ Unable to determine page token expiry:', debugError.message);
            }
        }

        console.log('\nDone.');
    } catch (error) {
        console.error('\n❌ Failed to retrieve tokens.');
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
