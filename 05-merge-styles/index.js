const fs = require('fs').promises;
const path = require('path');

async function mergeStyles() {
    const stylesDir = path.join(__dirname, 'styles');
    const distDir = path.join(__dirname, 'project-dist');
    const bundlePath = path.join(distDir, 'bundle.css');

    try {
        // Create project-dist directory if it doesn't exist
        await fs.mkdir(distDir, { recursive: true });

        // Read contents of styles directory
        const files = await fs.readdir(stylesDir, { withFileTypes: true });

        // Filter for CSS files and read their contents
        const cssContents = await Promise.all(
            files
            .filter(file => file.isFile() && path.extname(file.name) === '.css')
            .map(async(file) => {
                try {
                    const filePath = path.join(stylesDir, file.name);
                    const content = await fs.readFile(filePath, 'utf8');
                    // Add newline after each file's content to prevent style rules from merging
                    return content + '\n';
                } catch (error) {
                    console.error(`Error reading ${file.name}:`, error.message);
                    return ''; // Return empty string if file read fails
                }
            })
        );

        // Write the combined contents to bundle.css
        await fs.writeFile(bundlePath, cssContents.join(''));

        console.log('CSS bundle created successfully!');
    } catch (error) {
        console.error('Error during CSS bundling:', error.message);
        process.exit(1);
    }
}

// Run the bundler
mergeStyles();