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
            <h3 className="font-bold text-gray-900 mb-3">Discussion/Collaboration Room Usage Guidelines</h3>
            <p className="text-gray-700 mb-4">
              By using CircuLink, you agree to comply with these terms and conditions governing the use of Discussion/Collaboration Rooms.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Eligibility and Access</h3>
            <ul className="text-gray-700 list-disc list-inside space-y-1 text-sm">
              <li>Discussion/Collaboration Rooms are reserved for legitimate University of San Agustin faculty, staff, and students for academic purposes</li>
              <li>Only a group representative may make the reservation</li>
              <li>Users must fill out the Discussion/Collaboration Room Request Form and present their Faculty ID to the library staff before using the room</li>
              <li>Access is granted only if at least four (4) group members are physically present at the reservation time</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Group Size and Composition</h3>
            <ul className="text-gray-700 list-disc list-inside space-y-1 text-sm">
              <li>Room usage is limited to a minimum of four (4) and a maximum of eight (8) users per group</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Reservation Policies</h3>
            <ul className="text-gray-700 list-disc list-inside space-y-1 text-sm">
              <li>The room is available on a first-come, first-served basis</li>
              <li>Only one (1) reservation per day is allowed, and no more than two (2) reservations per group per week</li>
              <li>Reservations must be made through the librarian up to one day before the intended date of use</li>
              <li>The group will be notified 15 minutes before their time ends. If no reservation follows, a one-hour extension may be requested</li>
              <li>The Learning Resource Center may cancel any reservation if the group does not arrive within 15 minutes of the reserved time</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Room Usage and Conduct</h3>
            <ul className="text-gray-700 list-disc list-inside space-y-1 text-sm">
              <li>The assigned librarian will provide the key, remote control, and turn on the electricity prior to use</li>
              <li>Food and drinks are strictly prohibited inside the room</li>
              <li>Users must bring their own materials such as markers, pens, and paper</li>
              <li>Furniture must not be added, removed, or rearranged</li>
              <li>The room is for academic use only. Formal classes should not be held here</li>
              <li>Rooms must be vacated 15 minutes before the library closes</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Prohibited Activities</h3>
            <ul className="text-gray-700 list-disc list-inside space-y-1 text-sm">
              <li>Posting of visual aids</li>
              <li>Playing board games</li>
              <li>Gambling</li>
              <li>Creating projects involving printing, cutting, etc.</li>
              <li>Vandalism of any kind</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Responsibilities and Liabilities</h3>
            <ul className="text-gray-700 list-disc list-inside space-y-1 text-sm">
              <li>Users are responsible for any damages or losses in the room during their reservation</li>
              <li>The library is not responsible for lost or unattended personal items</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">General Provisions</h3>
            <ul className="text-gray-700 list-disc list-inside space-y-1 text-sm">
              <li>These guidelines are subject to change without prior notice</li>
              <li>All users must follow the Learning Resource Center's policies</li>
            </ul>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <p className="text-gray-700 text-sm">
              For questions or clarifications about these terms and conditions, please contact the library administration 
              at <span className="font-medium">circuLink@usa.edu.ph</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsConditionsModal;