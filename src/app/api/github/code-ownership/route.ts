import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function getFileOwnership(filePath: string) {
    try {
        const { stdout } = await execAsync(`git blame --line-porcelain ${filePath}`);
        const lines = stdout.split('\n');
        const authorCounts: { [author: string]: number } = {};

        for (const line of lines) {
            if (line.startsWith('author ')) {
                const author = line.substring(7);
                authorCounts[author] = (authorCounts[author] || 0) + 1;
            }
        }
        return authorCounts;
    } catch (error) {
        console.error(`Failed to get ownership for ${filePath}:`, error);
        return {};
    }
}

export async function GET() {
  try {
    const { stdout: filesOutput } = await execAsync('git ls-files');
    const files = filesOutput.split('\n').filter(Boolean); // Filter out empty lines

    const ownershipData: { name: string; author: string; lines: number }[] = [];

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
    
    // Aggregate by author
    const authorFileData: { [author: string]: { name: string; lines: number }[] } = {};
    for (const item of ownershipData) {
        if (!authorFileData[item.author]) {
            authorFileData[item.author] = [];
        }
        authorFileData[item.author].push({ name: item.name, lines: item.lines });
    }

    // Transform into hierarchical structure for the chart
    const hierarchicalData = {
        name: "Codebase",
        children: Object.entries(authorFileData).map(([author, files]) => ({
            name: author,
            children: files.map(file => ({
                name: file.name,
                value: file.lines,
                author: author // Pass author down for coloring
            }))
        }))
    };

    return NextResponse.json(hierarchicalData);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
} 