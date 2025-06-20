import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, readdir } from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

async function getFileOwnership(filePath) {
    try {
        const { stdout } = await execAsync(`git blame --line-porcelain "${filePath}"`);
        const lines = stdout.split('\n');
        const authorCounts = {};

        for (const line of lines) {
            if (line.startsWith('author ')) {
                const author = line.substring(7);
                authorCounts[author] = (authorCounts[author] || 0) + 1;
            }
        }
        return authorCounts;
    } catch (error) {
        // This can fail for binary files, which is expected.
        // console.error(`Skipping ownership for ${filePath}:`, error.message);
        return {};
    }
}

async function main() {
    console.log('Generating code ownership data...');
    const { stdout: filesOutput } = await execAsync('git ls-files');
    const files = filesOutput.split('\n').filter(Boolean);

    const ownershipData = [];

    for (const file of files) {
        if (!file) continue;
        const authorCounts = await getFileOwnership(file);
        for (const author in authorCounts) {
            ownershipData.push({
                name: file,
                author: author,
                lines: authorCounts[author],
            });
        }
    }

    const authorFileData = {};
    for (const item of ownershipData) {
        if (!authorFileData[item.author]) {
            authorFileData[item.author] = [];
        }
        authorFileData[item.author].push({ name: item.name, lines: item.lines });
    }

    const hierarchicalData = {
        name: "Codebase",
        children: Object.entries(authorFileData).map(([author, files]) => ({
            name: author,
            children: files.map(file => ({
                name: file.name,
                value: file.lines,
                author: author
            }))
        }))
    };

    const outputPath = path.join(process.cwd(), 'public', 'ownership-data.json');
    await writeFile(outputPath, JSON.stringify(hierarchicalData, null, 2));
    console.log(`Code ownership data written to ${outputPath}`);
}

main().catch(err => {
    console.error('Failed to generate code ownership data:', err);
    process.exit(1);
}); 