// DataPrivacyModal.jsx
import { X } from "lucide-react";

function DataPrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Data Privacy Policy</h2>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Introduction</h3>
              <p>
                The University of San Agustin Learning Resource Center (LRC) is committed to protecting 
                the privacy and security of your personal data. This Data Privacy Policy explains how 
                we collect, use, store, and protect your personal information in compliance with the 
                Data Privacy Act of 2012 (Republic Act No. 10173).
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Information We Collect</h3>
              <p>We collect the following personal information:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Full name and contact details</li>
                <li>University email address (@usa.edu.ph)</li>
                <li>ID number and academic information</li>
                <li>Department, program, and year level</li>
                <li>Library usage data and borrowing history</li>
                <li>System access logs and authentication data</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. How We Use Your Information</h3>
              <p>Your personal data is used for the following purposes:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>User account creation and management</li>
                <li>Library resource access and borrowing</li>
                <li>Communication regarding library services</li>
                <li>Statistical analysis and service improvement</li>
                <li>Compliance with university policies and regulations</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Data Protection</h3>
              <p>
                We implement appropriate security measures to protect your personal data against 
                unauthorized access, alteration, disclosure, or destruction. These include encryption, 
                access controls, and regular security assessments.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">5. Data Retention</h3>
              <p>
                Your personal data will be retained only for as long as necessary to fulfill the 
                purposes for which it was collected, or as required by applicable laws and university policies.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">6. Your Rights</h3>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Access your personal data</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">7. Contact Information</h3>
              <p>
                For any concerns regarding data privacy, please contact our Data Protection Officer at:
                <br />
                Email: dpo@usa.edu.ph
                <br />
                Phone: (033) 123-4567
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
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataPrivacyModal;