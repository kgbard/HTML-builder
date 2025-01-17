const fs = require('fs').promises;
const path = require('path');

async function displayFileInfo() {
    try {
        // Get the absolute path to the secret-folder
        const folderPath = path.join(__dirname, 'secret-folder');

        // Read directory contents with file types
        const files = await fs.readdir(folderPath, { withFileTypes: true });

        // Process each entry
        for (const file of files) {
            // Skip if it's not a file
            if (!file.isFile()) {
                continue;
            }

            // Get file stats
            const filePath = path.join(folderPath, file.name);
            const stats = await fs.stat(filePath);

            // Extract file information
            const fileName = path.parse(file.name).name;
            const fileExt = path.extname(file.name).slice(1); // Remove the dot
            const fileSize = stats.size;

            // Convert to kb if size is LARGE enough
            const sizeStr = fileSize > 1024 ?
                `${(fileSize / 1024).toFixed(3)}kb` :
                `${fileSize}b`;

            // Output in required format
            console.log(`${fileName} - ${fileExt} - ${sizeStr}`);
        }
    } catch (error) {
        console.error('Error reading folder:', error.message);
        process.exit(1);
    }
}

// Run the scanner
displayFileInfo();