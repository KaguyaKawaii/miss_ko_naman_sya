// TermsConditionsModal.jsx
import { X } from "lucide-react";

function TermsConditionsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-lg p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Terms & Conditions</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Acceptance of Terms</h3>
            <p className="text-gray-700 text-sm mb-2">
              By accessing and using CircuLink, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, you may not use the system.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">User Eligibility and Account</h3>
            <ul className="text-gray-700 list-disc list-inside space-y-1 text-sm">
              <li>Must be a currently enrolled student, faculty, or staff member of University of San Agustin</li>
              <li>Valid university credentials are required for authentication</li>
              <li>Accounts are personal and non-transferable</li>
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>The University reserves the right to verify user eligibility at any time</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Service Usage</h3>
            <ul className="text-gray-700 list-disc list-inside space-y-1 text-sm">
              <li>CircuLink is provided for academic purposes only</li>
              <li>You agree to use the system in compliance with all university policies</li>
              <li>Commercial use of reserved spaces is strictly prohibited</li>
              <li>You may not use the system for any illegal or unauthorized purpose</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Reservation Policies</h3>
            <ul className="text-gray-700 list-disc list-inside space-y-1 text-sm">
              <li>Reservations are subject to availability and university scheduling priorities</li>
              <li>The University reserves the right to cancel or modify reservations for institutional needs</li>
              <li>Repeated no-shows may result in suspension of reservation privileges</li>
              <li>Users must comply with all room capacity and usage guidelines</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Intellectual Property</h3>
            <ul className="text-gray-700 list-disc list-inside space-y-1 text-sm">
              <li>All content and software associated with CircuLink are property of University of San Agustin</li>
              <li>You may not reproduce, distribute, or create derivative works without authorization</li>
              <li>User-generated content remains the property of the user but grants the University license for operational purposes</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Limitation of Liability</h3>
            <p className="text-gray-700 text-sm mb-2">
              To the fullest extent permitted by law, University of San Agustin shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from:
            </p>
            <ul className="text-gray-700 list-disc list-inside space-y-1 text-sm">
              <li>System unavailability or technical failures</li>
              <li>Unauthorized access to or alteration of your transmissions or data</li>
              <li>Loss or damage to personal property in reserved spaces</li>
              <li>Any other matter relating to the service</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">User Conduct and Responsibilities</h3>
            <ul className="text-gray-700 list-disc list-inside space-y-1 text-sm">
              <li>You are responsible for any damages to university property during your reservation</li>
              <li>You must comply with all library and university conduct policies</li>
              <li>Misuse of the system may result in disciplinary action</li>
              <li>You agree to use reserved spaces in a manner that respects other users</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Termination</h3>
            <p className="text-gray-700 text-sm mb-2">
              The University reserves the right to suspend or terminate your access to CircuLink at any time, without notice, for conduct that:
            </p>
            <ul className="text-gray-700 list-disc list-inside space-y-1 text-sm">
              <li>Violates these Terms and Conditions</li>
              <li>Violates university policies</li>
              <li>May harm the University's interests or reputation</li>
              <li>Involves fraudulent or abusive behavior</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Modifications to Terms</h3>
            <p className="text-gray-700 text-sm">
              University of San Agustin reserves the right to modify these Terms and Conditions at any time. Continued use of CircuLink after changes constitutes acceptance of the modified terms.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Governing Law</h3>
            <p className="text-gray-700 text-sm">
              These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of the Philippines. Any disputes shall be subject to the exclusive jurisdiction of the courts of Iloilo City.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Contact Information</h3>
            <p className="text-gray-700 text-sm">
              For questions regarding these Terms and Conditions, please contact the University Administration at <span className="font-medium">circuLink@usa.edu.ph</span>.
            </p>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="text-gray-700 text-sm">
              <strong>Effective Date:</strong> December 2024<br/>
              By using CircuLink, you acknowledge that you have read and agree to these Terms and Conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsConditionsModal;