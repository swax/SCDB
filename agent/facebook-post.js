#!/usr/bin/env node

/**
 * Facebook Post Script
 * 
 * Usage: node facebook-post.js "Your post text" "https://your-page-url.com"
 * 
 * Required Environment Variables:
 * - FACEBOOK_PAGE_ACCESS_TOKEN: Your Facebook Page Access Token
 * - FACEBOOK_PAGE_ID: Your Facebook Page ID
 */

const https = require('https');
const querystring = require('querystring');

// Load environment variables from .env.local file
require('dotenv').config({ path: '.env.local' });

// Configuration - set these environment variables
const FACEBOOK_PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;

// Validate arguments
if (process.argv.length < 4) {
    console.error('Usage: node facebook-post.js "Post text" "Page URL"');
    console.error('Example: node facebook-post.js "Check out this sketch!" "https://sketchtv.lol/sketch/123"');
    process.exit(1);
}

// Validate environment variables
if (!FACEBOOK_PAGE_ACCESS_TOKEN) {
    console.error('Error: FACEBOOK_PAGE_ACCESS_TOKEN environment variable is required');
    process.exit(1);
}

if (!FACEBOOK_PAGE_ID) {
    console.error('Error: FACEBOOK_PAGE_ID environment variable is required');
    process.exit(1);
}

const postText = process.argv[2];
const pageUrl = process.argv[3];

// Create the post message
const message = `${postText}\n\n${pageUrl}`;

// Prepare the post data
const postData = querystring.stringify({
    message: message,
    access_token: FACEBOOK_PAGE_ACCESS_TOKEN
});

// Configure the request
const options = {
    hostname: 'graph.facebook.com',
    port: 443,
    path: `/v18.0/${FACEBOOK_PAGE_ID}/feed`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
    }
};

// Make the request
const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            
            if (res.statusCode === 200 && response.id) {
                console.log('✅ Post published successfully!');
                console.log('Post ID:', response.id);
                console.log('Post URL: https://facebook.com/' + response.id);
            } else {
                console.error('❌ Failed to publish post');
                console.error('Status:', res.statusCode);
                console.error('Response:', data);
            }
        } catch (error) {
            console.error('❌ Error parsing response:', error.message);
            console.error('Raw response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
});

// Send the request
req.write(postData);
req.end();

console.log('📤 Posting to Facebook...');
console.log('Message:', message);