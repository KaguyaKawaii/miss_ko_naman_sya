// TermsConditionsModal.jsx
import { X, Book, Clock, AlertTriangle, Users } from "lucide-react";

function TermsConditionsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Book className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Terms & Conditions</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-800 text-center font-medium">
              By using CircuLink, you agree to comply with these terms and conditions. Please read them carefully.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-lg mt-1">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Eligibility and Access</h3>
                <ul className="text-gray-700 space-y-2 text-sm">
                  <li>• Only currently enrolled University of San Agustin students may use this system</li>
                  <li>• Valid university credentials are required for authentication</li>
                  <li>• Access may be revoked for violation of these terms</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-100 rounded-lg mt-1">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Reservation Policies</h3>
                <ul className="text-gray-700 space-y-2 text-sm">
                  <li>• Maximum of 3 active reservations per student at any time</li>
                  <li>• Reservations can be made up to 7 days in advance</li>
                  <li>• Maximum booking duration: 4 hours per session</li>
                  <li>• Cancellations must be made at least 2 hours before scheduled time</li>
                  <li>• Late arrivals beyond 15 minutes may result in automatic cancellation</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-100 rounded-lg mt-1">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Prohibited Activities</h3>
                <ul className="text-gray-700 space-y-2 text-sm">
                  <li>• Making fraudulent or fake reservations</li>
                  <li>• Transferring reservations to other individuals</li>
                  <li>• Using rooms for commercial purposes</li>
                  <li>• Damaging library property or facilities</li>
                  <li>• Creating excessive noise or disturbance</li>
                  <li>• Violating university conduct policies</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Violations and Penalties</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 text-sm">
                Violation of these terms may result in temporary or permanent suspension of reservation privileges, 
                disciplinary action according to university policies, and/or liability for damages to university property.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">System Availability</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 text-sm">
                While we strive to maintain 24/7 system availability, CircuLink may be temporarily unavailable 
                for maintenance, updates, or due to unforeseen technical issues. The University is not liable 
                for reservations affected by system unavailability.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <h4 className="font-semibold text-blue-900 mb-2">Need Clarification?</h4>
            <p className="text-blue-800 text-sm">
              If you have any questions about these terms and conditions, please contact the library administration 
              at <span className="font-medium">circuLink@usa.edu.ph</span> before using the system.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 rounded-b-2xl p-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-gray-600 text-sm">
              Effective: December 2024
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Decline
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors duration-200 font-medium"
              >
                Accept Terms
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsConditionsModal;