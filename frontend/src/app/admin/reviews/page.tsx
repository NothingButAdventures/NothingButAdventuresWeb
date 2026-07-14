export default function ReviewsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="px-8 h-16 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-zinc-800 leading-none">Reviews</h1>
                        <p className="text-gray-555 text-xs mt-1 leading-none">Manage user ratings and feedback</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-8">
                <div className="bg-white rounded-md border border-gray-200 p-12 text-center shadow-sm">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-zinc-800 mb-2">
                        Reviews management coming soon
                    </h3>
                    <p className="text-gray-500">
                        This section is under construction. When available, you'll be able to moderate, approve, or hide customer tour reviews here.
                    </p>
                </div>
            </div>
        </div>
    );
}
