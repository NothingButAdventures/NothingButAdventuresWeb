const fs = require('fs');
const path = require('path');

const filePath = '/Users/akarshrajput/Documents/NothingButAdventuresWeb/frontend/src/app/trips/[slug]/[tourCode]/checkout/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. paymentOption state
content = content.replace(
    /const \[paymentOption, setPaymentOption\] = useState<"full" \| "deposit">"full"\);/,
    'const [paymentOption, setPaymentOption] = useState<"full" | "deposit" | "parts">("full");'
);

content = content.replace(
    'const [paymentOption, setPaymentOption] = useState<"full" | "deposit">("full");',
    'const [paymentOption, setPaymentOption] = useState<"full" | "deposit" | "parts">("full");'
);

// 2. depositAmount and payNowAmount
const amountsRegex = /const depositAmount = useMemo\(\(\) => \{[\s\S]*?\}, \[calculateTotalPrice\]\);/;
content = content.replace(
    /const depositAmount = useMemo\(\(\) => \{\s*if \(\!tour\) return 0;\s*const percentage = tour\.price\.bookingPercentage \|\| 20;\s*return Math\.round\(calculateTotalPrice \* \(percentage \/ 100\)\);\s*\}, \[calculateTotalPrice, tour\]\);\s*const payNowAmount = useMemo\(\(\) => \{\s*return paymentOption === "deposit" && isDepositAvailable \? depositAmount : calculateTotalPrice;\s*\}, \[paymentOption, isDepositAvailable, depositAmount, calculateTotalPrice\]\);/,
    `const depositAmount = useMemo(() => {
        if (!tour) return 0;
        return Math.round(calculateTotalPrice * 0.10);
    }, [calculateTotalPrice, tour]);

    const partsAmount = useMemo(() => {
        if (!tour) return 0;
        return Math.round(calculateTotalPrice * 0.25);
    }, [calculateTotalPrice, tour]);

    const payNowAmount = useMemo(() => {
        if (paymentOption === "deposit" && isDepositAvailable) return depositAmount;
        if (paymentOption === "parts" && isDepositAvailable) return partsAmount;
        return calculateTotalPrice;
    }, [paymentOption, isDepositAvailable, depositAmount, partsAmount, calculateTotalPrice]);`
);

// 3. canProceed
content = content.replace(
    /const canProceed = \(\) => \{\s*switch \(currentStep\) \{\s*case 1:\s*return primaryTraveller\.firstName && primaryTraveller\.lastName;\s*case 2:\s*return selectedDateId !== null;\s*case 3:\s*return true; \/\/ Optional step\s*case 4:\s*return true; \/\/ Optional step\s*case 5:\s*return contactInfo\.email && contactInfo\.phone;\s*default:\s*return false;\s*\}\s*\};/,
    `const canProceed = () => {
        switch (currentStep) {
            case 1:
                return primaryTraveller.firstName && primaryTraveller.lastName && contactInfo.email && contactInfo.phone;
            case 2:
                return selectedDateId !== null;
            case 3:
                return true; // Optional step
            case 4:
                return true; 
            default:
                return false;
        }
    };`
);

// 4. handleContinue
content = content.replace(
    /const handleContinue = \(\) => \{\s*if \(currentStep < 5\) \{\s*setCurrentStep\(\(prev\) => \(prev \+ 1\) as CheckoutStep\);\s*\} else \{\s*\/\/ Submit booking\s*handleSubmitBooking\(\);\s*\}\s*\};/,
    `const handleContinue = () => {
        if (currentStep < 4) {
            setCurrentStep((prev) => (prev + 1) as CheckoutStep);
        } else {
            // Submit booking
            handleSubmitBooking();
        }
    };`
);

// 5. Stepper insertion
content = content.replace(
    /<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">/,
    `{/* Stepper */}
                <div className="mb-10 max-w-4xl mx-auto px-4 hidden md:block">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute top-2.5 left-0 w-full h-[2px] bg-gray-300 -z-10"></div>
                        <div className="absolute top-2.5 left-0 h-[2px] bg-[#3F3F42] -z-10 transition-all duration-300" style={{ width: \`\${((Math.min(currentStep, 5) - 1) / 4) * 100}%\` }}></div>

                        {[
                            { num: 1, label: "Passenger Details" },
                            { num: 2, label: "Select Tour Dates" },
                            { num: 3, label: "Add ons" },
                            { num: 4, label: "Payment Options" },
                            { num: 5, label: "Booking Complete" }
                        ].map((s) => (
                            <div key={s.num} className="flex flex-col items-center relative z-10 w-24">
                                <div className={\`w-5 h-5 rounded-full border-[2px] flex items-center justify-center bg-white transition-colors duration-300 \${currentStep >= s.num ? "border-[#3F3F42]" : "border-gray-400"}\`}>
                                    {currentStep >= s.num && <div className="w-2.5 h-2.5 rounded-full bg-[#3F3F42]" />}
                                </div>
                                <span className={\`text-xs mt-3 text-center whitespace-nowrap \${currentStep >= s.num ? "text-[#3F3F42] font-medium" : "text-gray-500"}\`}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">`
);

// 6. Step 1 Replacement
const step1Regex = /\{\/\* Step 1: Who's Travelling \*\/\}[\s\S]*?(?=\{\/\* Step 2: Select Departure Date \*\/)/;
content = content.replace(
    step1Regex,
    `{/* Step 1: Passenger Details */}
                        {currentStep >= 1 && (
                            <div className={\`bg-white rounded-xl shadow-sm border p-6 \${currentStep !== 1 ? "opacity-60" : ""}\`}>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-[#3F3F42]">Passenger Details</h2>
                                    {currentStep > 1 && (
                                        <button
                                            onClick={() => setCurrentStep(1)}
                                            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>

                                {currentStep === 1 ? (
                                    <>
                                        <div className="mb-8">
                                            <h3 className="font-semibold text-[#3F3F42] mb-4">Traveller & Contact Information</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">
                                                        Title <span className="text-gray-400">ⓘ</span>
                                                    </label>
                                                    <select
                                                        value={primaryTraveller.title}
                                                        onChange={(e) =>
                                                            setPrimaryTraveller({ ...primaryTraveller, title: e.target.value })
                                                        }
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    >
                                                        <option value="">--</option>
                                                        <option value="Mr">Mr</option>
                                                        <option value="Mrs">Mrs</option>
                                                        <option value="Ms">Ms</option>
                                                        <option value="Dr">Dr</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">First name</label>
                                                    <input
                                                        type="text"
                                                        value={primaryTraveller.firstName}
                                                        onChange={(e) =>
                                                            setPrimaryTraveller({ ...primaryTraveller, firstName: e.target.value })
                                                        }
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        placeholder="First Name"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">Last name</label>
                                                    <input
                                                        type="text"
                                                        value={primaryTraveller.lastName}
                                                        onChange={(e) =>
                                                            setPrimaryTraveller({ ...primaryTraveller, lastName: e.target.value })
                                                        }
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        placeholder="Last Name"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">Email *</label>
                                                    <input
                                                        type="email"
                                                        value={contactInfo.email}
                                                        onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        placeholder="email@example.com"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">Phone *</label>
                                                    <input
                                                        type="tel"
                                                        value={contactInfo.phone}
                                                        onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        placeholder="+1 234 567 8900"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm text-gray-600 mb-1">Address</label>
                                                    <input
                                                        type="text"
                                                        value={contactInfo.address}
                                                        onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        placeholder="Street address"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">City</label>
                                                    <input
                                                        type="text"
                                                        value={contactInfo.city}
                                                        onChange={(e) => setContactInfo({ ...contactInfo, city: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        placeholder="City"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">Postal Code</label>
                                                    <input
                                                        type="text"
                                                        value={contactInfo.postalCode}
                                                        onChange={(e) => setContactInfo({ ...contactInfo, postalCode: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        placeholder="Postal code"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">Country</label>
                                                    <input
                                                        type="text"
                                                        value={contactInfo.country}
                                                        onChange={(e) => setContactInfo({ ...contactInfo, country: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        placeholder="Country"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-[#3F3F42]">
                                        {primaryTraveller.title} {primaryTraveller.firstName} {primaryTraveller.lastName} • {contactInfo.email}
                                    </div>
                                )}
                            </div>
                        )}

                        `
);

// 7. Rename Step 2 and 3 headers
content = content.replace(
    /<h2 className="text-xl font-bold text-purple-700">Select a departure date below<\/h2>/,
    '<h2 className="text-xl font-bold text-purple-700">Select Tour Dates</h2>'
);
content = content.replace(
    /<h2 className="text-xl font-bold text-\[\#3F3F42\]">Activities & Extras<\/h2>/,
    '<h2 className="text-xl font-bold text-[#3F3F42]">Add ons</h2>'
);


// 8. Replace Step 4 and Step 5 with new Step 4
const step45Regex = /\{\/\* Step 4: Travel Extras \*\/\}[\s\S]*?(?=\{\/\* Navigation Buttons \*\/)/;
content = content.replace(
    step45Regex,
    `{/* Step 4: Payment Options */}
                        {currentStep >= 4 && (
                            <div className={\`bg-white rounded-xl shadow-sm border p-6 \${currentStep !== 4 ? "opacity-60" : ""}\`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-[#3F3F42]">Payment Options</h2>
                                    {currentStep > 4 && (
                                        <button
                                            onClick={() => setCurrentStep(4)}
                                            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>

                                {currentStep === 4 ? (
                                    <>
                                        <div className="grid grid-cols-1 gap-4">
                                            {/* Full Payment Option */}
                                            <div
                                                className={\`border rounded-xl p-4 cursor-pointer transition-all \${paymentOption === 'full'
                                                    ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600'
                                                    : 'border-gray-300 hover:border-gray-400'
                                                    }\`}
                                                onClick={() => setPaymentOption('full')}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={\`w-5 h-5 rounded-full border flex items-center justify-center \${paymentOption === 'full' ? 'border-purple-600' : 'border-gray-400'
                                                        }\`}>
                                                        {paymentOption === 'full' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-semibold text-[#3F3F42]">Pay Full Amount</span>
                                                            <span className="font-bold text-[#3F3F42]">{formatPrice(calculateTotalPrice)}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 mt-1">Pay the total amount now and you're all set!</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Partial Payment Option */}
                                            <div
                                                className={\`border rounded-xl p-4 transition-all \${!isDepositAvailable
                                                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-75'
                                                    : paymentOption === 'deposit'
                                                        ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600 cursor-pointer'
                                                        : 'border-gray-300 hover:border-gray-400 cursor-pointer'
                                                    }\`}
                                                onClick={() => isDepositAvailable && setPaymentOption('deposit')}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={\`w-5 h-5 rounded-full border flex items-center justify-center \${!isDepositAvailable ? 'border-gray-300 bg-gray-100' :
                                                        paymentOption === 'deposit' ? 'border-purple-600' : 'border-gray-400'
                                                        }\`}>
                                                        {paymentOption === 'deposit' && isDepositAvailable && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className={\`font-semibold \${!isDepositAvailable ? 'text-gray-500' : 'text-[#3F3F42]'}\`}>
                                                                Pay Deposit (10%)
                                                            </span>
                                                            <span className={\`font-bold \${!isDepositAvailable ? 'text-gray-500' : 'text-[#3F3F42]'}\`}>
                                                                {formatPrice(depositAmount)}
                                                            </span>
                                                        </div>
                                                        {isDepositAvailable ? (
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                Pay {formatPrice(depositAmount)} now. The remaining {formatPrice(calculateTotalPrice - depositAmount)} is due later.
                                                            </p>
                                                        ) : (
                                                            <p className="text-sm text-red-500 mt-1">
                                                                Partial payment is only available for trips booked at least 3 months in advance.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Pay in Parts Option */}
                                            <div
                                                className={\`border rounded-xl p-4 transition-all \${!isDepositAvailable
                                                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-75'
                                                    : paymentOption === 'parts'
                                                        ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600 cursor-pointer'
                                                        : 'border-gray-300 hover:border-gray-400 cursor-pointer'
                                                    }\`}
                                                onClick={() => isDepositAvailable && setPaymentOption('parts')}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={\`w-5 h-5 rounded-full border flex items-center justify-center \${!isDepositAvailable ? 'border-gray-300 bg-gray-100' :
                                                        paymentOption === 'parts' ? 'border-purple-600' : 'border-gray-400'
                                                        }\`}>
                                                        {paymentOption === 'parts' && isDepositAvailable && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className={\`font-semibold \${!isDepositAvailable ? 'text-gray-500' : 'text-[#3F3F42]'}\`}>
                                                                Pay in Parts
                                                            </span>
                                                            <span className={\`font-bold \${!isDepositAvailable ? 'text-gray-500' : 'text-[#3F3F42]'}\`}>
                                                                {formatPrice(partsAmount)}
                                                            </span>
                                                        </div>
                                                        {isDepositAvailable ? (
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                Pay 25% now. The remaining 75% will be split into equal monthly installments.
                                                            </p>
                                                        ) : (
                                                            <p className="text-sm text-red-500 mt-1">
                                                                Pay in parts is only available for trips booked at least 3 months in advance.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-[#3F3F42]">
                                        {paymentOption === "full" ? "Pay Full Amount" : paymentOption === "deposit" ? "Pay Deposit (10%)" : "Pay in Parts"} selected
                                    </div>
                                )}
                            </div>
                        )}

                        `
);

content = content.replace(/\{currentStep === 5 \? "Complete Booking" : "Continue"\}/, '{currentStep === 4 ? "Complete Booking" : "Continue"}');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Checkout page rewritten successfully.');
