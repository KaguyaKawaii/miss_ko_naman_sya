// HowToUseModal.jsx
import { X } from "lucide-react";

function HowToUseModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-2xl p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">How to Use the System</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Getting Started</h3>
            <div className="space-y-3 text-gray-700">
              <p>Follow these steps to make your room reservation:</p>
              
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                <h4 className="font-semibold text-amber-900 mb-2">Step 1: Login</h4>
                <p className="text-amber-800">Use your University credentials to access the system.</p>
              </div>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <h4 className="font-semibold text-blue-900 mb-2">Step 2: Browse Available Rooms</h4>
                <p className="text-blue-800">View study rooms, research hubs, and collaboration spaces with real-time availability.</p>
              </div>
              
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                <h4 className="font-semibold text-green-900 mb-2">Step 3: Select Time Slot</h4>
                <p className="text-green-800">Choose your preferred date and time for the reservation.</p>
              </div>
              
              <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded">
                <h4 className="font-semibold text-purple-900 mb-2">Step 4: Confirm Booking</h4>
                <p className="text-purple-800">Review your details and confirm the reservation.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Important Notes</h3>
            <ul className="space-y-2 text-gray-700 list-disc list-inside">
              <li>Reservations can be made up to 7 days in advance</li>
              <li>Maximum booking duration: 4 hours per session</li>
              <li>Cancellations must be made at least 2 hours before the scheduled time</li>
              <li>Bring your student ID for verification at the library</li>
              <li>Late arrivals beyond 15 minutes may result in cancellation</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
            <p className="text-gray-700">
              Contact library staff at <span className="text-amber-600">circuLink@usa.edu.ph</span> or visit the help desk.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 rounded-b-2xl p-4 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors duration-200 font-medium"
            >
              Got It
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HowToUseModal;