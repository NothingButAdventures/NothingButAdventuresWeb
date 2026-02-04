export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
                {/* Minimal spinner */}
                <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-600 animate-spin"></div>
                </div>
                {/* Optional loading text */}
                <span className="text-sm font-medium text-gray-500 tracking-wide">Loading...</span>
            </div>
        </div>
    );
}
