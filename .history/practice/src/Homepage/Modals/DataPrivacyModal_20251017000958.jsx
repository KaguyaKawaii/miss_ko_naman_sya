// DataPrivacyModal.jsx
import { X, Shield, Lock, Eye } from "lucide-react";

function DataPrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Data Privacy Notice</h2>
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
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <p className="text-blue-800 text-center font-medium">
              Your privacy is important to us. This notice explains how we collect, use, and protect your personal information.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg mt-1">
                  <Lock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Information We Collect</h3>
                  <ul className="text-gray-700 space-y-1 text-sm">
                    <li>• Student identification number</li>
                    <li>• Name and contact information</li>
                    <li>• Academic department and year level</li>
                    <li>• Room reservation history</li>
                    <li>• Usage patterns and preferences</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg mt-1">
                  <Eye className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">How We Use Your Data</h3>
                  <ul className="text-gray-700 space-y-1 text-sm">
                    <li>• Process room reservations</li>
                    <li>• Improve library services</li>
                    <li>• Generate usage analytics</li>
                    <li>• Send important notifications</li>
                    <li>• Ensure fair resource allocation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Data Protection</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 text-sm">
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. Your data is stored securely 
                and accessed only by authorized personnel for legitimate purposes.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Rights</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Right to access your personal data",
                "Right to correct inaccurate information",
                "Right to request data deletion",
                "Right to object to processing",
                "Right to data portability",
                "Right to withdraw consent"
              ].map((right, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  <span className="text-sm text-gray-700">{right}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 text-sm">
                For any questions regarding your data privacy, please contact our Data Protection Officer at:
                <br />
                <span className="text-amber-600 font-medium">dpo@usa.edu.ph</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 rounded-b-2xl p-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-gray-600 text-sm">
              Last updated: December 2024
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors duration-200 font-medium"
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