const fs = require('fs');
const path = './frontend/src/app/trips/[slug]/[tourCode]/checkout/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Remove Header
const headerStart = '{/* Header */}';
const headerEnd = '{/* Main Content */}';
const hStartIndex = code.indexOf(headerStart);
const hEndIndex = code.indexOf(headerEnd);
if (hStartIndex !== -1 && hEndIndex !== -1) {
    code = code.substring(0, hStartIndex) + code.substring(hEndIndex);
}

// 2. Rename Step 1 title
code = code.replace(
    /<h2 className="text-xl font-bold text-\[\#3F3F42\]">Who&apos;s travelling\?<\/h2>/g,
    '<h2 className="text-xl font-bold text-[#3F3F42]">Passenger details</h2>'
);

// 3. Move Contact Info from Step 5 to Step 1
const contactStartAnchor = '                                        <div className="mb-8">\n                                            <h3 className="font-semibold text-[#3F3F42] mb-4 flex items-center gap-2">\n                                                <span className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm">1</span>\n                                                {primaryTraveller.title} {primaryTraveller.firstName} {primaryTraveller.lastName} (Primary)\n                                            </h3>';
const contactEndAnchor = '                                            </div>\n                                        ))}\n\n                                        {/* Error Message */}';

const cStart = code.indexOf(contactStartAnchor);
const cEnd = code.indexOf(contactEndAnchor);

if (cStart !== -1 && cEnd !== -1) {
    let contactBlock = code.substring(cStart, cEnd + '                                            </div>\n                                        ))}'.length);
    
    // Remove from step 5
    const pStartAnchor = '<div className="bg-gray-50 rounded-lg p-4 mb-6">\n                                            <p className="text-sm text-gray-600">\n                                                To book your adventure';
    const pStart = code.indexOf(pStartAnchor);
    if (pStart !== -1) {
        code = code.substring(0, pStart) + '{/* Moved to step 1 */}\n' + code.substring(cEnd + contactEndAnchor.length);
    }

    // Insert to step 1
    const step1InsertAnchor = '                                                <div>\n                                                    <label className="block text-sm text-gray-600 mb-1">Last name</label>\n                                                    <input\n                                                        type="text"\n                                                        value={primaryTraveller.lastName}\n                                                        onChange={(e) =>\n                                                            setPrimaryTraveller({ ...primaryTraveller, lastName: e.target.value })\n                                                        }\n                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"\n                                                        placeholder="Singh"\n                                                    />\n                                                </div>\n                                            </div>\n                                        </div>';
    const step1Index = code.indexOf(step1InsertAnchor);
    if (step1Index !== -1) {
        contactBlock = contactBlock.replace(/<h3 className="font-semibold text-\[\#3F3F42\] mb-4 flex items-center gap-2">[\s\S]*?<\/h3>/, '');
        code = code.substring(0, step1Index + step1InsertAnchor.length) + '\n\n' + contactBlock + code.substring(step1Index + step1InsertAnchor.length);
    } else {
        console.error("Step 1 insert point not found");
    }
} else {
    console.error("Contact form anchors not found");
}

// 4. Rename Step 2 title
code = code.replace(
    '<h2 className="text-xl font-bold text-purple-700">Select a departure date below</h2>',
    '<h2 className="text-xl font-bold text-purple-700">Select tour dates</h2>'
);

// 5. Merge Step 3 and 4 into Add-ons
code = code.replace(
    '<h3 className="text-lg font-bold text-[#3F3F42] mb-2">\n                                                Activities for {tour.name}\n                                            </h3>',
    '<h3 className="text-lg font-bold text-[#3F3F42] mb-2">\n                                                Add-ons\n                                            </h3>'
);

code = code.replace(/\{currentStep >= 4 && \(\n\s*<div className=\{`bg-white rounded-xl shadow-sm border p-6 \$\{currentStep !== 4 \? "opacity-60" : ""\}`\}>\n\s*<div className="flex items-center justify-between mb-4">\n\s*<h2 className="text-xl font-bold text-\[\#3F3F42\]">Travel extras<\/h2>\n\s*\{currentStep > 4 && \(\n\s*<button\n\s*onClick=\{.*?\}\n\s*className="text-purple-600 hover:text-purple-700 text-sm font-medium"\n\s*>\n\s*Edit\n\s*<\/button>\n\s*\)\}\n\s*<\/div>\n\n\s*\{currentStep === 4 \? \(/g, 
`{currentStep >= 3 && (
                            <div className={\`bg-white rounded-xl shadow-sm border p-6 \${currentStep !== 3 ? "opacity-60" : ""}\`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-[#3F3F42]">Travel extras</h2>
                                </div>
                                {currentStep === 3 ? (`
);

code = code.replace(
    /<button\n\s*onClick=\{\(\) => setCurrentStep\(5\)\}\n\s*className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"\n\s*>\n\s*Continue\n\s*<\/button>/g,
    '{/* Button removed */}'
);

// 6. Rename Step 5 to Step 4 Payment Options
code = code.replace(/\{\/\* Step 5: Traveller Details & Contact Info \*\/\}/g, '{/* Step 4: Payment Options */}');
code = code.replace('<h2 className="text-xl font-bold text-[#3F3F42] mb-6">Traveller & Contact Information</h2>', '<h2 className="text-xl font-bold text-[#3F3F42] mb-6">Payment Options</h2>');
code = code.replace(/currentStep >= 5/g, 'currentStep >= 4');
code = code.replace(/currentStep !== 5/g, 'currentStep !== 4');
code = code.replace(/currentStep === 5 \? \(/g, 'currentStep === 4 ? (');
code = code.replace(/currentStep === 5 \? "Complete Booking" : "Continue"/g, 'currentStep === 4 ? "Complete Booking" : "Continue"');

fs.writeFileSync(path, code);
console.log('Script done');
