// DataPrivacyModal.jsx
import { X, Shield, Lock, Eye, FileText, Scale, Gavel } from "lucide-react";

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
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Data Privacy Notice</h2>
              <p className="text-sm text-gray-600">Compliant with Republic Act 10173</p>
            </div>
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
          {/* Republic Act 10173 Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Gavel className="w-6 h-6" />
              <h3 className="text-xl font-bold">Republic Act 10173</h3>
            </div>
            <p className="text-blue-100 mb-4">
              Also known as the <strong>Data Privacy Act of 2012</strong>, this law protects individuals' 
              personal information in information and communications systems in the government and private sector.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Protects personal data processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Ensures free flow of information</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Upholds privacy as a human right</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Regulates data collection and use</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Provides legal remedies for violations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Establishes National Privacy Commission</span>
                </div>
              </div>
            </div>
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
                    <li>• Email address and phone number</li>
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
                    <li>• Comply with academic requirements</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Data Protection Principles */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-600" />
              Data Protection Principles (Under RA 10173)
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  title: "Transparency",
                  description: "You have the right to be informed about how your data is collected and used"
                },
                {
                  title: "Legitimate Purpose",
                  description: "Data is collected only for declared, specified, and legitimate purposes"
                },
                {
                  title: "Proportionality",
                  description: "Data collected is adequate, relevant, and necessary for its purpose"
                },
                {
                  title: "Data Quality",
                  description: "Personal data shall be accurate, complete, and up-to-date"
                },
                {
                  title: "Security",
                  description: "Reasonable safeguards protect your data against unauthorized access"
                },
                {
                  title: "Retention Limitation",
                  description: "Data is retained only for as long as necessary for its purpose"
                }
              ].map((principle, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">{principle.title}</h4>
                  <p className="text-gray-700 text-xs">{principle.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Rights Under RA 10173</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  right: "Right to Access",
                  description: "Obtain copies of your personal data"
                },
                {
                  right: "Right to Rectification",
                  description: "Correct inaccurate or incomplete data"
                },
                {
                  right: "Right to Erasure",
                  description: "Delete your personal data under certain conditions"
                },
                {
                  right: "Right to Restrict Processing",
                  description: "Temporarily stop processing your data"
                },
                {
                  right: "Right to Data Portability",
                  description: "Receive your data in a structured format"
                },
                {
                  right: "Right to Object",
                  description: "Object to processing of your personal data"
                },
                {
                  right: "Right to be Informed",
                  description: "Know why and how your data is processed"
                },
                {
                  right: "Right to Damages",
                  description: "Claim compensation for privacy violations"
                }
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{item.right}</h4>
                    <p className="text-gray-700 text-xs">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Security Measures */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Our Security Measures</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm mb-3">
                In compliance with RA 10173, we implement appropriate organizational, physical, and technical measures to ensure the security of your personal data:
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-blue-800">Encrypted data transmission</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-blue-800">Access controls and authentication</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-blue-800">Regular security audits</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-blue-800">Secure data storage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-blue-800">Staff privacy training</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-blue-800">Incident response protocols</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 text-sm">
                For any questions regarding your data privacy or to exercise your rights under RA 10173, please contact:
              </p>
              <div className="mt-3 space-y-2">
                <p className="text-gray-700 text-sm">
                  <strong>University Data Protection Officer:</strong><br />
                  <span className="text-amber-600 font-medium">dpo@usa.edu.ph</span>
                </p>
                <p className="text-gray-700 text-sm">
                  <strong>National Privacy Commission:</strong><br />
                  <span className="text-amber-600 font-medium">info@privacy.gov.ph</span>
                </p>
                <p className="text-gray-700 text-sm">
                  <strong>NPC Hotline:</strong> 
                  <span className="text-amber-600 font-medium ml-2">+63 2 8234 2228</span>
                </p>
              </div>
            </div>
          </div>

          {/* Legal Compliance Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-900 mb-2">Legal Compliance Notice</h4>
                <p className="text-amber-800 text-sm">
                  This data privacy notice is issued in compliance with the Republic Act 10173 (Data Privacy Act of 2012) 
                  and its implementing rules and regulations. The University of San Agustin is committed to protecting 
                  your personal data and ensuring your privacy rights are respected.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 rounded-b-2xl p-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-gray-600 text-sm">
              Last updated: December 2024 | Compliant with RA 10173
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