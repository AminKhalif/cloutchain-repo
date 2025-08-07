import { Video } from 'lucide-react';

export function EmptySubmissionsState() {
  return (
    <div className="text-center py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl"></div>
      <div className="relative z-10">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
          <Video className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">Ready to Get Paid?</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Submit TikTok videos, let our AI verify quality, and get paid automatically when metrics hit!
        </p>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 max-w-lg mx-auto border border-purple-100">
          <div className="flex items-center gap-4 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              AI Content Review
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Metrics Tracking
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Auto Payment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}