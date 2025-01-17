const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create write stream for the output file
const writeStream = fs.createWriteStream(
    path.join(__dirname, 'output.txt'), { flags: 'a' } // 'a' flag for appending
);

// Create interface for reading from console
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Display welcome message
console.log('Welcome! Enter text to write to file. Type "exit" to quit.');

// Handle line input
rl.on('line', (input) => {
    if (input.toLowerCase() === 'exit') {
        console.log('Goodbye! Thanks for using the file writer.');
        rl.close();
        process.exit(0);
    }

    // Write the input to file with a newline
    writeStream.write(input + '\n', (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return;
        }
    });
});

// Handle Ctrl+C
process.on('SIGINT', () => {
    console.log('\nGoodbye! Thanks for using the file writer.');
    writeStream.end();
    process.exit(0);
});

// Handle cleanup
process.on('exit', () => {
    writeStream.end();
});

// Handle errors
writeStream.on('error', (error) => {
    console.error('Error with the write stream:', error);
    process.exit(1);
});