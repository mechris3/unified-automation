import * as fs from 'fs';
import * as path from 'path';

export interface Journey {
  id: string;
  name: string;
  path: string;
}

export async function discoverJourneys(): Promise<Journey[]> {
  const journeysDir = path.join(__dirname, '../../test-infrastructure/src/journeys');
  
  if (!fs.existsSync(journeysDir)) return [];
  
  const files = fs.readdirSync(journeysDir)
    .filter(f => f.endsWith('.ts'))
    .sort();
  
  return files.map(file => {
    // handles sample.journey.ts -> sample
    const id = file.replace(/\.journey\.ts$/, '').replace(/\.ts$/, '');
    return {
      id,
      name: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      path: path.join(journeysDir, file)
    };
  });
}
