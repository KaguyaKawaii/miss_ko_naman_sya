// HowToUseModal.jsx
import {
  X,
  UserCheck,
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  Trash2,
  RotateCw,
} from "lucide-react";

function HowToUseModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-2xl p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">How the USA-FLD System Works — Step by Step</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="Close how-to modal"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-gray-800">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="p-3 bg-amber-50 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">1. Sign in & Verification</h3>
              <p className="mt-1 text-sm">
                Log in with your university credentials. Verified accounts get full reservation privileges. If your account is not verified,
                the system will show a warning and block some actions (you can still view rooms and request verification).
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="p-3 bg-blue-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">2. Pick a date on the calendar</h3>
              <p className="mt-1 text-sm">
                Click any date on the Dashboard calendar to open the Room Availability modal. The modal groups rooms by floor and shows which
                rooms are free or occupied for your chosen date and times.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="p-3 bg-green-50 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">3. Browse rooms & choose location</h3>
              <p className="mt-1 text-sm">
                Browse rooms by floor and room name. Each room shows current reservations (Approved or Pending) with time ranges so you can
                avoid conflicts.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4">
            <div className="p-3 bg-purple-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-700" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">4. Select time slot & duration</h3>
              <p className="mt-1 text-sm">
                Choose a start time and end time. Rules enforced by the backend:
              </p>

              <ul className="mt-2 ml-5 list-disc list-inside text-sm space-y-1 text-gray-700">
                <li>Maximum reservation duration: 4 hours.</li>
                <li>Reservations allowed up to 7 days in advance.</li>
                <li>Each user: max 2 different days per week, and only 1 reservation per day (participants are allowed if no time overlap).</li>
                <li>System prevents overlapping reservations for the same room/time slot.</li>
              </ul>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex gap-4">
            <div className="p-3 bg-sky-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-sky-700" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">5. Add participants (optional)</h3>
              <p className="mt-1 text-sm">
                Add other users as participants by their university IDs or emails. Participants can join the reservation but will be checked
                for time conflicts so no double-bookings happen.
              </p>
            </div>
          </div>

          {/* Step 6 */}
          <div className="flex gap-4">
            <div className="p-3 bg-emerald-50 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">6. System validations (backend)</h3>
              <p className="mt-1 text-sm">
                When you submit a reservation, the backend validates:
              </p>
              <ul className="mt-2 ml-5 list-disc list-inside text-sm space-y-1 text-gray-700">
                <li>Overlapping reservations (room and participant conflicts).</li>
                <li>Duplicate participants blocked.</li>
                <li>User reservation limits per week/day enforced.</li>
                <li>Verified status check for certain actions.</li>
              </ul>
            </div>
          </div>

          {/* Step 7 */}
          <div className="flex gap-4">
            <div className="p-3 bg-amber-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">7. Reservation statuses</h3>
              <p className="mt-1 text-sm">
                After submission a reservation can be:
              </p>
              <ul className="mt-2 ml-5 list-disc list-inside text-sm space-y-1 text-gray-700">
                <li><strong>Pending</strong> — waiting for approval.</li>
                <li><strong>Approved</strong> — confirmed (room shows as occupied on the chosen times).</li>
                <li><strong>Cancelled</strong> — either by the requester or an admin.</li>
              </ul>
            </div>
          </div>

          {/* Step 8 */}
          <div className="flex gap-4">
            <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">8. Cancelling, early end & extension</h3>
              <p className="mt-1 text-sm">
                You can cancel reservations (must be done at least 2 hours before the scheduled time ideally). You may also:
              </p>
              <ul className="mt-2 ml-5 list-disc list-inside text-sm space-y-1 text-gray-700">
                <li>End a session early so the room becomes available.</li>
                <li>Request a time extension — subject to validation for overlaps and admin approval.</li>
              </ul>
            </div>
          </div>

          {/* Step 9 */}
          <div className="flex gap-4">
            <div className="p-3 bg-rose-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-rose-700" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">9. What to do if something's wrong</h3>
              <p className="mt-1 text-sm">
                If a reservation conflict or other problem occurs:
              </p>
              <ul className="mt-2 ml-5 list-disc list-inside text-sm space-y-1 text-gray-700">
                <li>Check the Room Availability modal for overlapping time blocks.</li>
                <li>Use the “Report a Problem” modal to submit issue details (include floor & room if relevant).</li>
                <li>Contact library staff: <span className="text-amber-600">circuLink@usa.edu.ph</span></li>
              </ul>
            </div>
          </div>

          {/* Step 10 */}
          <div className="flex gap-4">
            <div className="p-3 bg-indigo-50 rounded-lg flex items-center justify-center">
              <RotateCw className="w-6 h-6 text-indigo-700" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">10. Live updates & syncing</h3>
              <p className="mt-1 text-sm">
                The Dashboard and availability modal refresh automatically while open (so you see near real-time changes). After making a
                reservation the app emits events to refresh history and dashboard views.
              </p>
            </div>
          </div>

          {/* Quick tips */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Quick tips</h4>
            <ul className="ml-5 list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Always double-check time ranges in the availability modal before booking.</li>
              <li>Upload or keep your profile picture updated so staff can verify easily.</li>
              <li>If you’re added as a participant, confirm there’s no personal time conflict in your schedule.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 rounded-b-2xl p-4 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors duration-200 font-medium"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HowToUseModal;
