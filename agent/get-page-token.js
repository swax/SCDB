#!/usr/bin/env node

/**
 * Facebook Page Token Retriever
 * 
 * Usage: node get-page-token.js
 * 
 * Required Environment Variables:
 * - FACEBOOK_USER_ACCESS_TOKEN: Your User Access Token
 */

const https = require('https');

// Load environment variables from .env.local file
require('dotenv').config({ path: '.env.local' });

const USER_ACCESS_TOKEN = process.env.FACEBOOK_USER_ACCESS_TOKEN;

if (!USER_ACCESS_TOKEN) {
    console.error('Error: FACEBOOK_USER_ACCESS_TOKEN environment variable is required');
    process.exit(1);
}

// Get pages managed by this user
const options = {
    hostname: 'graph.facebook.com',
    port: 443,
    path: `/v18.0/me/accounts?access_token=${USER_ACCESS_TOKEN}`,
    method: 'GET'
};

const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            
            if (res.statusCode === 200 && response.data) {
                console.log('✅ Found pages:');
                response.data.forEach(page => {
                    console.log(`\nPage: ${page.name}`);
                    console.log(`ID: ${page.id}`);
                    console.log(`Access Token: ${page.access_token}`);
                    console.log(`Category: ${page.category}`);
                    console.log('---');
                });
            } else {
                console.error('❌ Failed to get pages');
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

req.end();

console.log('📤 Getting your Facebook pages...');