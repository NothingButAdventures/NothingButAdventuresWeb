const fs = require('fs');
const path = './frontend/src/app/trips/[slug]/[tourCode]/checkout/page.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

const startBlock = lines.findIndex((l, idx) => idx > 1000 && l.includes('<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">'));
const endBlock = lines.findIndex((l, idx) => idx > startBlock && l.includes('))}'));

if (startBlock !== -1 && endBlock !== -1) {
    const contactBlock = lines.slice(startBlock, endBlock + 1);
    
    // remove from step 4
    for (let i = startBlock; i <= endBlock; i++) {
        lines[i] = '';
    }
    
    // Also remove the "To book your adventure..." block and the primary traveller h3
    const pStart = lines.findIndex((l, idx) => idx > 1000 && l.includes('<div className="bg-gray-50 rounded-lg p-4 mb-6">'));
    if (pStart !== -1 && pStart < startBlock && pStart > startBlock - 20) {
        for (let i = pStart; i < startBlock; i++) {
            lines[i] = '';
        }
    }

    // Insert into Step 1
    const insertIdx = lines.findIndex(l => l.includes('placeholder="Singh"')) + 4;
    lines.splice(insertIdx, 0, '\n' + contactBlock.join('\n'));
    console.log("Moved contact form successfully!");
} else {
    console.log("Could not find start or end block.");
}

fs.writeFileSync(path, lines.join('\n'));
