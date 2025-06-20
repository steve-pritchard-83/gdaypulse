import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET() {
  try {
    // Construct the path to the file in the `public` directory
    const jsonPath = path.join(process.cwd(), 'public', 'ownership-data.json');
    // Read the file
    const fileContents = await fs.readFile(jsonPath, 'utf8');
    // Parse the JSON
    const data = JSON.parse(fileContents);
    // Return the data
    return NextResponse.json(data);
  } catch (error) {
    // Log the error for debugging purposes on the server
    console.error('Failed to read or parse ownership data:', error);

    // In a production environment, you might not want to expose detailed error messages.
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Failed to load code ownership data.', details: message }, { status: 500 });
  }
} 