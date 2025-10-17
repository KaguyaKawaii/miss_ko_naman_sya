// TermsConditionsModal.jsx
import { X } from "lucide-react";

function TermsConditionsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Terms & Conditions</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4 text-gray-700">
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h3>
              <p>
                By accessing and using the University of San Agustin Learning Resource Center (LRC) 
                system, you agree to be bound by these Terms and Conditions. If you do not agree 
                with any part of these terms, you must not use the system.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. User Accounts</h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Accounts are personal and non-transferable</li>
                <li>You must provide accurate and complete information during registration</li>
                <li>You are responsible for maintaining the confidentiality of your login credentials</li>
                <li>You must immediately report any unauthorized use of your account</li>
                <li>The LRC reserves the right to suspend or terminate accounts for violations</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Acceptable Use</h3>
              <p>You agree to use the LRC system for lawful purposes only and shall not:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Engage in any fraudulent or malicious activities</li>
                <li>Attempt to compromise system security</li>
                <li>Share your account with others</li>
                <li>Use the system to distribute spam or malicious content</li>
                <li>Violate any university policies or applicable laws</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Library Resources</h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Borrowed materials must be returned by the due date</li>
                <li>You are responsible for any damage or loss of borrowed items</li>
                <li>Overdue materials may result in borrowing privileges suspension</li>
                <li>Digital resources are for educational purposes only</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">5. Intellectual Property</h3>
              <p>
                All content, resources, and materials provided through the LRC system are protected 
                by copyright and other intellectual property laws. You may not reproduce, distribute, 
                or modify any content without proper authorization.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">6. Privacy</h3>
              <p>
                Your use of the LRC system is subject to our Data Privacy Policy. We collect and 
                process your personal data in accordance with applicable data protection laws.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">7. System Availability</h3>
              <p>
                The LRC strives to maintain system availability but does not guarantee uninterrupted 
                access. We may perform maintenance, updates, or modifications that may temporarily 
                affect system availability.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">8. Termination</h3>
              <p>
                The LRC reserves the right to terminate or suspend access to the system immediately, 
                without prior notice, for conduct that violates these Terms and Conditions or 
                university policies.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">9. Changes to Terms</h3>
              <p>
                We reserve the right to modify these Terms and Conditions at any time. Continued 
                use of the system after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">10. Governing Law</h3>
              <p>
                These Terms and Conditions shall be governed by and construed in accordance with 
                the laws of the Republic of the Philippines.
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
            >
              I Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsConditionsModal;