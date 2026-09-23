import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { parseDirectory, fetchDirectory } from '../server/representatives.js';
const directory=process.argv.includes('--from-file')?parseDirectory(await readFile('scripts/representatives-source.html','utf8')):await fetchDirectory();
await mkdir('public/data',{recursive:true});
await writeFile('public/data/representatives.json',JSON.stringify(directory,null,2)+'\n');
console.log(`Saved ${directory.people.length} people, ${directory.people.filter(p=>p.roles.some(r=>r.group==='board')).length} board members.`);
