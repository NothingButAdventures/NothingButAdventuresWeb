const fs = require('fs');
const path = './frontend/src/app/trips/[slug]/[tourCode]/checkout/page.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Helper to find index
const findIndex = (search) => lines.findIndex(l => l.includes(search));

// Rename Step 2 title
const step2Idx = findIndex('<h2 className="text-xl font-bold text-purple-700">Select a departure date below</h2>');
if (step2Idx !== -1) {
    lines[step2Idx] = lines[step2Idx].replace('Select a departure date below', 'Select tour dates');
}

// Rename Step 3 title
const step3Idx = findIndex('Activities for {tour.name}');
if (step3Idx !== -1) {
    lines[step3Idx] = lines[step3Idx].replace('Activities for {tour.name}', 'Add-ons');
}

// Merge Step 4 into Step 3
// We need to find the boundary where Step 3 ends and Step 4 begins
const step4StartIdx = findIndex('{/* Step 4: Travel Extras */}');
if (step4StartIdx !== -1) {
    // Find the end of step 3 block right before this
    // It's usually `)} </div> )}`
    // Let's just remove the wrappers
    const wrapperStart = findIndex('{currentStep >= 4 && (');
    if (wrapperStart !== -1 && wrapperStart > step4StartIdx) {
        // Change the logic to be under step 3
        const step4ContentStart = findIndex('{currentStep === 4 ? (');
        if (step4ContentStart !== -1) {
            lines[step4ContentStart] = lines[step4ContentStart].replace('{currentStep === 4 ? (', '{currentStep === 3 ? (');
            
            // Remove the header of Step 4 Travel Extras and the Edit button
            const extraHeaderStart = findIndex('<div className="flex items-center justify-between mb-4">');
            if (extraHeaderStart !== -1 && extraHeaderStart > step4StartIdx && extraHeaderStart < step4ContentStart) {
                // Remove the extraHeader block
                // It ends with `</div>` before `currentStep === 4 ? (`
                for(let i = extraHeaderStart; i < step4ContentStart; i++) {
                    lines[i] = '';
                }
                // Re-add a simple title
                lines[extraHeaderStart] = '                                    <h2 className="text-xl font-bold text-[#3F3F42] mb-4 mt-8">Travel extras</h2>';
            }
            
            // We need to change the Step 4 wrapper to Step 3 wrapper. 
            // Wait, if we just remove the wrapper boundary entirely, it flows naturally.
            // Let's remove lines from step3 end to step4 start
            // Step 3 end is above step4StartIdx
            let i = step4StartIdx - 1;
            while(i > 0 && !lines[i].includes(') : (')) {
                if (lines[i].includes('</div>') || lines[i].includes(')}')) {
                    lines[i] = '';
                }
                i--;
            }
            
            lines[step4StartIdx] = ''; // {/* Step 4: Travel Extras */}
            lines[wrapperStart] = ''; // {currentStep >= 4 && (
            lines[wrapperStart+1] = ''; // <div className=...
        }
    }
}

// Rename Step 5 to Step 4 "Payment Options"
const step5StartIdx = findIndex('{/* Step 5: Traveller Details & Contact Info */}');
if (step5StartIdx !== -1) {
    lines[step5StartIdx] = lines[step5StartIdx].replace('Step 5: Traveller Details & Contact Info', 'Step 4: Payment Options');
    
    for (let i = step5StartIdx; i < lines.length; i++) {
        if (lines[i].includes('currentStep >= 5')) lines[i] = lines[i].replace('currentStep >= 5', 'currentStep >= 4');
        if (lines[i].includes('currentStep !== 5')) lines[i] = lines[i].replace('currentStep !== 5', 'currentStep !== 4');
        if (lines[i].includes('currentStep === 5')) lines[i] = lines[i].replace('currentStep === 5', 'currentStep === 4');
        if (lines[i].includes('Traveller & Contact Information')) lines[i] = lines[i].replace('Traveller & Contact Information', 'Payment Options');
    }
}

fs.writeFileSync(path, lines.join('\n'));
console.log('Done script 2');
