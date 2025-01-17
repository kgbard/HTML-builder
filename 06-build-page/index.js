const fs = require('fs').promises;
const path = require('path');

async function buildPage() {
    const projectRoot = __dirname;
    const distDir = path.join(projectRoot, 'project-dist');
    const componentsDir = path.join(projectRoot, 'components');
    const stylesDir = path.join(projectRoot, 'styles');
    const assetsDir = path.join(projectRoot, 'assets');

    try {
        // Create project-dist directory
        await fs.mkdir(distDir, { recursive: true });

        // Process HTML template
        await processTemplate(projectRoot, distDir, componentsDir);

        // Bundle styles
        await bundleStyles(stylesDir, distDir);

        // Copy assets
        await copyAssets(assetsDir, path.join(distDir, 'assets'));

        console.log('Page built successfully!');
    } catch (error) {
        console.error('Error building page:', error.message);
        process.exit(1);
    }
}

async function processTemplate(projectRoot, distDir, componentsDir) {
    try {
        // Read template file
        const templatePath = path.join(projectRoot, 'template.html');
        let templateContent = await fs.readFile(templatePath, 'utf8');

        // Find all component tags using regex
        const tagPattern = /{{(\s*[\w-]+\s*)}}/g;
        const componentPromises = [];
        const components = new Map();

        // Collect all unique components
        let match;
        while ((match = tagPattern.exec(templateContent)) !== null) {
            const componentName = match[1].trim();
            if (!components.has(componentName)) {
                const componentPath = path.join(componentsDir, `${componentName}.html`);
                componentPromises.push(
                    fs.readFile(componentPath, 'utf8')
                    .then(content => components.set(componentName, content))
                    .catch(error => {
                        if (error.code === 'ENOENT') {
                            console.error(`Component ${componentName}.html not found`);
                            components.set(componentName, ''); // Empty string for missing components
                        } else {
                            throw error;
                        }
                    })
                );
            }
        }

        // Wait for all components to be read
        await Promise.all(componentPromises);

        // Replace all tags with component content
        const processedContent = templateContent.replace(tagPattern, (match, componentName) => {
            return components.get(componentName.trim()) || '';
        });

        // Write processed HTML to index.html
        await fs.writeFile(path.join(distDir, 'index.html'), processedContent);
    } catch (error) {
        throw new Error(`Template processing failed: ${error.message}`);
    }
}

async function bundleStyles(stylesDir, distDir) {
    try {
        const files = await fs.readdir(stylesDir, { withFileTypes: true });

        const cssContents = await Promise.all(
            files
            .filter(file => file.isFile() && path.extname(file.name) === '.css')
            .map(async file => {
                const content = await fs.readFile(
                    path.join(stylesDir, file.name),
                    'utf8'
                );
                return content + '\n';
            })
        );

        await fs.writeFile(
            path.join(distDir, 'style.css'),
            cssContents.join('')
        );
    } catch (error) {
        throw new Error(`Style bundling failed: ${error.message}`);
    }
}

async function copyAssets(source, target) {
    try {
        // Create target directory
        await fs.mkdir(target, { recursive: true });

        // Read source directory
        const entries = await fs.readdir(source, { withFileTypes: true });

        // Process each entry
        for (const entry of entries) {
            const sourcePath = path.join(source, entry.name);
            const targetPath = path.join(target, entry.name);

            if (entry.isDirectory()) {
                // Recursively copy subdirectories
                await copyAssets(sourcePath, targetPath);
            } else {
                // Copy files
                await fs.copyFile(sourcePath, targetPath);
            }
        }
    } catch (error) {
        throw new Error(`Assets copying failed: ${error.message}`);
    }
}

// Run the builder
buildPage();