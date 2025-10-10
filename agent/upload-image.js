#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load environment variables from .env.local file
require('dotenv').config({ path: '.env.local' });

// Check Node.js version
const nodeVersion = parseInt(process.version.slice(1));
if (nodeVersion < 18) {
    console.error('Error: This script requires Node.js 18 or higher (for built-in fetch and FormData)');
    process.exit(1);
}

// Function to display usage
function usage() {
    console.log('Usage: node upload-image.js <image_path> <table_name> <base_url> [--verbose]');
    console.log('Example: node upload-image.js /path/to/image.jpg sketch https://www.sketchtv.lol');
    console.log('Example: node upload-image.js /path/to/image.jpg sketch http://localhost:3000 --verbose');
    console.log('');
    console.log('Options:');
    console.log('  --verbose    Show detailed progress information');
    console.log('');
    console.log('Set your API token in .env.local as UPLOAD_API_TOKEN');
    process.exit(1);
}

// Function to get API token
function getToken() {
    if (!process.env.UPLOAD_API_TOKEN) {
        console.error('Error: UPLOAD_API_TOKEN not found in .env.local');
        process.exit(1);
    }
    return process.env.UPLOAD_API_TOKEN;
}

// Function to calculate SHA-256 hash (first 8 characters)
function calculateHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    return hash.substring(0, 8);
}

// Function to get file MIME type
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'image/jpeg';
}

// Function to make HTTP request
async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return await response.text();
        }
    } catch (error) {
        throw new Error(`Request failed: ${error.message}`);
    }
}

// Main upload function
async function uploadImage(imagePath, tableName, baseUrl, verbose = false) {
    try {
        if (verbose) {
            console.log('📸 Starting upload process...');
        }
        
        // Validate image file exists
        if (!fs.existsSync(imagePath)) {
            throw new Error(`Image file '${imagePath}' not found`);
        }
        
        // Get file information
        const fileStats = fs.statSync(imagePath);
        const fileSize = fileStats.size;
        const mimeType = getMimeType(imagePath);
        const fileHash = calculateHash(imagePath);
        const fileName = path.basename(imagePath);
        const token = getToken();
        
        if (verbose) {
            console.log(`File: ${imagePath}`);
            console.log(`Name: ${fileName}`);
            console.log(`Size: ${fileSize} bytes`);
            console.log(`Type: ${mimeType}`);
            console.log(`Hash: ${fileHash}`);
            console.log(`Table: ${tableName}`);
            console.log('');
        }
        
        // Step 1: Begin upload
        if (verbose) {
            console.log('🚀 Step 1: Getting presigned URL...');
        }
        const beginResponse = await makeRequest(`${baseUrl}/api/upload-image/begin`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                table_name: tableName,
                file_name: fileName,
                mime_type: mimeType,
                file_size: fileSize,
                file_hash: fileHash
            })
        });
        
        if (!beginResponse.success) {
            throw new Error(`Failed to get presigned URL: ${beginResponse.error || 'Unknown error'}`);
        }
        
        const { presigned_post, aws_key } = beginResponse;
        if (verbose) {
            console.log('✅ Presigned URL obtained');
            console.log(`S3 URL: ${presigned_post.url}`);
            console.log(`AWS Key: ${aws_key}`);
            console.log('');
        }
        
        // Step 2: Upload to S3
        if (verbose) {
            console.log('☁️  Step 2: Uploading to S3...');
        }
        
        // Create FormData for S3 upload
        const formData = new FormData();
        
        // Add all the presigned post fields
        Object.entries(presigned_post.fields).forEach(([key, value]) => {
            formData.append(key, value);
        });
        
        // Add the file as a buffer with proper metadata
        const fileBuffer = fs.readFileSync(imagePath);
        formData.append('file', new Blob([fileBuffer], { type: mimeType }), fileName);
        
        // Upload to S3
        const s3Response = await fetch(presigned_post.url, {
            method: 'POST',
            body: formData
        });
        
        if (!s3Response.ok) {
            const errorText = await s3Response.text();
            throw new Error(`S3 upload failed: ${s3Response.status} ${s3Response.statusText}\n${errorText}`);
        }
        
        if (verbose) {
            console.log('✅ Upload to S3 completed');
            console.log('');
        }
        
        // Step 3: Finish upload
        if (verbose) {
            console.log('🏁 Step 3: Creating database record...');
        }
        const finishResponse = await makeRequest(`${baseUrl}/api/upload-image/finish`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cdn_key: aws_key
            })
        });
        
        if (!finishResponse.success) {
            throw new Error(`Failed to create database record: ${finishResponse.error || 'Unknown error'}`);
        }
        
        if (verbose) {
            console.log('✅ Database record created');
            console.log('');
            console.log('🎉 Upload completed successfully!');
            console.log(`CDN Key: ${aws_key}`);
        }
            
        console.log(`Image ID: ${finishResponse.image_id}`);
        
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

// Check if we're running as a script
if (require.main === module) {
    // Parse arguments
    const args = process.argv.slice(2);
    const verboseIndex = args.indexOf('--verbose');
    const verbose = verboseIndex !== -1;
    
    // Remove --verbose from args
    if (verbose) {
        args.splice(verboseIndex, 1);
    }
    
    // Check remaining arguments
    if (args.length !== 3) {
        usage();
    }
    
    const imagePath = args[0];
    const tableName = args[1];
    const baseUrl = args[2];
    
    uploadImage(imagePath, tableName, baseUrl, verbose);
}

module.exports = { uploadImage };
