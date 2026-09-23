import ExcelJS from 'exceljs';
import { mkdir } from 'node:fs/promises';
import { HEADERS } from '../server/calendar.js';
const book=new ExcelJS.Workbook();const sheet=book.addWorksheet('Kalender');
sheet.addTable({name:'Kalender',ref:'A1',headerRow:true,style:{theme:'TableStyleMedium2',showRowStripes:true},columns:HEADERS.map(name=>({name})),rows:[['example-1','Exempel – ersätt med verkligt möte','2026-10-10','18:00','2026-10-10','19:30','Plats','Adress','Beskrivning','planerad','nej']]});
sheet.columns.forEach(col=>col.width=20);sheet.getColumn(2).width=42;sheet.getColumn(9).width=50;
await mkdir('artifacts',{recursive:true});await book.xlsx.writeFile('artifacts/kalender-mall.xlsx');console.log('Created artifacts/kalender-mall.xlsx (example is unpublished)');
