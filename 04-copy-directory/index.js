const fs = require('fs').promises;
const path = require('path');

async function copyDir() {
    const sourceDir = path.join(__dirname, 'files');
    const targetDir = path.join(__dirname, 'files-copy');

    try {
        // Create or ensure the target directory exists
        await fs.mkdir(targetDir, { recursive: true });

        // Read contents of source directory
        const files = await fs.readdir(sourceDir);

        // Get list of existing files in target directory
        const existingFiles = await fs.readdir(targetDir).catch(() => []);

        // Remove files from target that no longer exist in source
        for (const existingFile of existingFiles) {
            if (!files.includes(existingFile)) {
                await fs.unlink(path.join(targetDir, existingFile));
            }
        }

        // Copy each file from source to target
        const copyPromises = files.map(async(file) => {
            const sourcePath = path.join(sourceDir, file);
            const targetPath = path.join(targetDir, file);

            try {
                // Get source file stats
                const stats = await fs.stat(sourcePath);

                // Only copy if it's a file (not a directory)
                if (stats.isFile()) {
                    // Copy the file
                    await fs.copyFile(sourcePath, targetPath);
                }
            } catch (error) {
                console.error(`Error copying file ${file}:`, error.message);
            }
        });

        // Wait for all copy operations to complete
        await Promise.all(copyPromises);

        console.log('Directory copied successfully!');
    } catch (error) {
        console.error('Error during directory copy:', error.message);
        process.exit(1);
    }
}

// Run the copy operation
copyDir();