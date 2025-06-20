import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, rm } from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);
const REPO_URL = 'https://github.com/steve-pritchard-83/futrwebsite.git';

async function getFileOwnership(filePath, repoPath) {
    try {
        const { stdout } = await execAsync(`git blame --line-porcelain "${filePath}"`, { cwd: repoPath });
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
    console.log('Generating code ownership data from remote repository...');
    
    const tmpRepoPath = path.join(process.cwd(), 'tmp-ownership-repo');

    try {
        console.log(`Cloning repository: ${REPO_URL}`);
        await rm(tmpRepoPath, { recursive: true, force: true });
        await execAsync(`git clone --depth 1 ${REPO_URL} ${tmpRepoPath}`);

        console.log('Analyzing file ownership...');
        const { stdout: filesOutput } = await execAsync('git ls-files', { cwd: tmpRepoPath });
        const files = filesOutput.split('\n').filter(Boolean);

        const ownershipData = [];

        // This can be slow for large repositories, consider sampling or parallelizing
        for (const file of files) {
            if (!file) continue;
            const authorCounts = await getFileOwnership(file, tmpRepoPath);
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
    } catch(err) {
        console.error('An error occurred during ownership generation:', err);
        process.exit(1);
    } finally {
        console.log('Cleaning up temporary repository...');
        await rm(tmpRepoPath, { recursive: true, force: true });
    }
}

main().catch(err => {
    console.error('Failed to generate code ownership data:', err);
    process.exit(1);
}); 