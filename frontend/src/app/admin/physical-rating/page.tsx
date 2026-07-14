export default function PhysicalRatingPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="px-8 h-16 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-zinc-800 leading-none">Physical Rating</h1>
                        <p className="text-gray-555 text-xs mt-1 leading-none">Configure tour physical level parameters</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-8">
                <div className="bg-white rounded-md border border-gray-200 p-12 text-center shadow-sm">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-zinc-800 mb-2">
                        Physical Rating parameters coming soon
                    </h3>
                    <p className="text-gray-500">
                        This section is under construction. Please use the <a href="/admin/physical-ratings" className="text-zinc-900 font-semibold underline">Physical Ratings Dashboard</a> to configure levels 1-5.
                    </p>
                </div>
            </div>
        </div>
    );
}
