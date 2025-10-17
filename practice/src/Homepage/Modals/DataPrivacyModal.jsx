// DataPrivacyModal.jsx
import { X } from "lucide-react";

function DataPrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-lg p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Data Privacy Notice</h2>
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
            <h3 className="font-bold text-gray-900 mb-3">Republic Act 10173 - Data Privacy Act of 2012</h3>
            <p className="text-gray-700 mb-4">
              This law protects individuals' personal information in information and communications systems 
              in the government and private sector.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Information We Collect</h3>
            <ul className="text-gray-700 list-disc list-inside space-y-1 text-sm">
              <li>Student identification number</li>
              <li>Name and contact information</li>
              <li>Academic department and year level</li>
              <li>Room reservation history</li>
              <li>Usage patterns and preferences</li>
              <li>Email address and phone number</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">How We Use Your Data</h3>
            <ul className="text-gray-700 list-disc list-inside space-y-1 text-sm">
              <li>Process room reservations</li>
              <li>Improve library services</li>
              <li>Generate usage analytics</li>
              <li>Send important notifications</li>
              <li>Ensure fair resource allocation</li>
              <li>Comply with academic requirements</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Data Protection Principles (Under RA 10173)</h3>
            <ul className="text-gray-700 list-disc list-inside space-y-1 text-sm">
              <li>Transparency - You have the right to be informed about how your data is collected and used</li>
              <li>Legitimate Purpose - Data is collected only for declared, specified, and legitimate purposes</li>
              <li>Proportionality - Data collected is adequate, relevant, and necessary for its purpose</li>
              <li>Data Quality - Personal data shall be accurate, complete, and up-to-date</li>
              <li>Security - Reasonable safeguards protect your data against unauthorized access</li>
              <li>Retention Limitation - Data is retained only for as long as necessary for its purpose</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Your Rights Under RA 10173</h3>
            <ul className="text-gray-700 list-disc list-inside space-y-1 text-sm">
              <li>Right to Access - Obtain copies of your personal data</li>
              <li>Right to Rectification - Correct inaccurate or incomplete data</li>
              <li>Right to Erasure - Delete your personal data under certain conditions</li>
              <li>Right to Restrict Processing - Temporarily stop processing your data</li>
              <li>Right to Data Portability - Receive your data in a structured format</li>
              <li>Right to Object - Object to processing of your personal data</li>
              <li>Right to be Informed - Know why and how your data is processed</li>
              <li>Right to Damages - Claim compensation for privacy violations</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Our Security Measures</h3>
            <p className="text-gray-700 text-sm mb-2">
              In compliance with RA 10173, we implement appropriate measures to ensure the security of your personal data:
            </p>
            <ul className="text-gray-700 list-disc list-inside space-y-1 text-sm">
              <li>Encrypted data transmission</li>
              <li>Access controls and authentication</li>
              <li>Regular security audits</li>
              <li>Secure data storage</li>
              <li>Staff privacy training</li>
              <li>Incident response protocols</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Contact Information</h3>
            <p className="text-gray-700 text-sm">
              For any questions regarding your data privacy or to exercise your rights under RA 10173, please contact:
            </p>
            <ul className="text-gray-700 list-disc list-inside space-y-1 text-sm mt-2">
              <li>University Data Protection Officer: dpo@usa.edu.ph</li>
              <li>National Privacy Commission: info@privacy.gov.ph</li>
              <li>NPC Hotline: +63 2 8234 2228</li>
            </ul>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="text-gray-700 text-sm">
              This data privacy notice is issued in compliance with the Republic Act 10173 (Data Privacy Act of 2012) 
              and its implementing rules and regulations. The University of San Agustin is committed to protecting 
              your personal data and ensuring your privacy rights are respected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataPrivacyModal;