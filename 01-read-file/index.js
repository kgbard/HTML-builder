const fs = require('fs');
const path = require('path');

// Create a read stream from text.txt with an absolute path
const readStream = fs.createReadStream(
    path.join(__dirname, 'text.txt'),
    'utf8'
);

// Pipe the read stream directly to stdout
readStream.pipe(process.stdout);

// Handle potential errors
readStream.on('error', (error) => {
    console.error('Error reading the file:', error);
    process.exit(1);
});