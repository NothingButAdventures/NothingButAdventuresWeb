const fs = require('fs');
const path = require('path');

const filePath = '/Users/akarshrajput/Documents/NothingButAdventuresWeb/frontend/src/app/trips/[slug]/[tourCode]/checkout/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// The rewrite replaced A with B. So we replace B with A.

// 1. paymentOption state
content = content.replace(
    'const [paymentOption, setPaymentOption] = useState<"full" | "deposit" | "parts">("full");',
    'const [paymentOption, setPaymentOption] = useState<"full" | "deposit">("full");'
);

// 2. depositAmount and payNowAmount
const partsAmountBlock = `const depositAmount = useMemo(() => {
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
    }, [paymentOption, isDepositAvailable, depositAmount, partsAmount, calculateTotalPrice]);`;

const origDepositAmountBlock = `const depositAmount = useMemo(() => {
        if (!tour) return 0;
        const percentage = tour.price.bookingPercentage || 20;
        return Math.round(calculateTotalPrice * (percentage / 100));
    }, [calculateTotalPrice, tour]);

    const payNowAmount = useMemo(() => {
        return paymentOption === "deposit" && isDepositAvailable ? depositAmount : calculateTotalPrice;
    }, [paymentOption, isDepositAvailable, depositAmount, calculateTotalPrice]);`;

content = content.replace(partsAmountBlock, origDepositAmountBlock);

// 3. canProceed
const newCanProceed = `const canProceed = () => {
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
    };`;

const origCanProceed = `const canProceed = () => {
        switch (currentStep) {
            case 1:
                return primaryTraveller.firstName && primaryTraveller.lastName;
            case 2:
                return selectedDateId !== null;
            case 3:
                return true; // Optional step
            case 4:
                return true; // Optional step
            case 5:
                return contactInfo.email && contactInfo.phone;
            default:
                return false;
        }
    };`;

content = content.replace(newCanProceed, origCanProceed);

// 4. handleContinue
const newHandleContinue = `const handleContinue = () => {
        if (currentStep < 4) {
            setCurrentStep((prev) => (prev + 1) as CheckoutStep);
        } else {
            // Submit booking
            handleSubmitBooking();
        }
    };`;

const origHandleContinue = `const handleContinue = () => {
        if (currentStep < 5) {
            setCurrentStep((prev) => (prev + 1) as CheckoutStep);
        } else {
            // Submit booking
            handleSubmitBooking();
        }
    };`;

content = content.replace(newHandleContinue, origHandleContinue);

// 5. Stepper insertion (remove it and replace grid start)
const newStepper = `{/* Stepper */}
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">`;

content = content.replace(newStepper, '<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">');

// 6. Rename Step 2 and 3 headers
content = content.replace(
    '<h2 className="text-xl font-bold text-purple-700">Select Tour Dates</h2>',
    '<h2 className="text-xl font-bold text-purple-700">Select a departure date below</h2>'
);
content = content.replace(
    '<h2 className="text-xl font-bold text-[#3F3F42]">Add ons</h2>',
    '<h2 className="text-xl font-bold text-[#3F3F42]">Activities & Extras</h2>'
);

// 7. Revert Complete Booking button ternary
content = content.replace('{currentStep === 4 ? "Complete Booking" : "Continue"}', '{currentStep === 5 ? "Complete Booking" : "Continue"}');


fs.writeFileSync(filePath, content, 'utf8');
console.log('Checkout page simple reverts done. The complex block replacements are skipped because we do not have the exact original blocks in this script. Checking what is left...');
