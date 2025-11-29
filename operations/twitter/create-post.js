#!/usr/bin/env node

const https = require('https');
const crypto = require('crypto');
const { URL } = require('url');

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

const API_HOST = 'api.twitter.com';
const API_BASE_URL = 'https://api.twitter.com';
const TWEET_MAX_LENGTH = 280;

// Validate CLI arguments
if (process.argv.length < 4) {
    console.error('Usage: node operations/twitter/create-post.js "Post text" "URL"');
    console.error(
        'Example: node operations/twitter/create-post.js "Check this out!" "https://sketchtv.lol/sketch/123"'
    );
    process.exit(1);
}

// Validate environment variables
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

const postText = process.argv[2];
const pageUrl = process.argv[3];
const extraArgument = process.argv[4];

if (extraArgument !== undefined) {
    console.warn(
        '⚠️ Twitter scheduling via API is not supported by this script. Ignoring additional argument.'
    );
}

const tweetText = [postText, pageUrl].filter(Boolean).join(' ').trim();

if (!tweetText) {
    console.error('Error: Unable to build tweet text from provided arguments.');
    process.exit(1);
}

if (tweetText.length > TWEET_MAX_LENGTH) {
    console.error(
        `Error: Tweet exceeds ${TWEET_MAX_LENGTH} characters (got ${tweetText.length}).`
    );
    process.exit(1);
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
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'User-Agent': 'SketchTV Twitter Post Script/1.0'
        };

        let requestBody;

        if (body) {
            requestBody = JSON.stringify(body);
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

async function postTweet(text) {
    return twitterRequest({
        method: 'POST',
        path: '/2/tweets',
        body: { text }
    });
}

async function main() {
    try {
        console.log('🔐 Using Twitter user access token from environment');

        console.log('\n📤 Posting to Twitter...');
        console.log('Tweet:', tweetText);

        const response = await postTweet(tweetText);

        const tweetId = response?.data?.id;

        if (tweetId) {
            console.log('\n✅ Tweet published successfully!');
            console.log('Tweet ID:', tweetId);

            if (TWITTER_HANDLE) {
                console.log(`Tweet URL: https://x.com/${TWITTER_HANDLE}/status/${tweetId}`);
            } else {
                console.log(`Tweet URL: https://x.com/i/web/status/${tweetId}`);
            }
        } else {
            console.error('❌ Unexpected response from Twitter.');
            console.error(JSON.stringify(response, null, 2));
            process.exit(1);
        }
    } catch (error) {
        console.error('\n❌ Failed to publish tweet.');
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
