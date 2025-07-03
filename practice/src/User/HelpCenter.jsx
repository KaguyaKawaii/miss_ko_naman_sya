import React from "react";
import { ArrowLeft } from "lucide-react";

export default function HelpCenter({ setView }) {
  return (
    <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">
      {/* HEADER */}
      <header className="bg-[#CC0000] text-white px-4 h-[50px] flex items-center">
        <h1 className="text-xl md:text-2xl font-semibold">Help Center</h1>
      </header>

      {/* CONTENT */}
      <div className="p-6 flex-1 overflow-y-auto">

        <div className="space-y-4">
          {/* Section 1 */}
          <details className="border border-red-300 shadow-sm rounded-lg p-4">
  <summary className="font-medium cursor-pointer text-gray-800">
    Getting Started
  </summary>
  <div className="border-b border-gray-300 mt-3"></div>
  <div className="mt-2 text-sm text-gray-600 space-y-3 leading-relaxed">
    <p>
  <span className="font-semibold">How to sign up and log in:</span><br />
  Go to the homepage and click the <span className="font-medium text-blue-600">“Login”</span> button. If you don’t have an account yet, click the <span className="font-medium text-blue-600">“Sign Up”</span> link located below the login form. Fill out your full name, ID number, email, and password, then select your role as either <span className="italic">Student</span> or <span className="italic">Faculty</span>. After signing up, you will need to verify your ID number before using the reservation system. Once verified, log in with your email and password to access your dashboard.
</p>


   <p>
  <span className="font-semibold">Student vs Faculty account roles:</span><br />
  When signing up, choose your correct role based on your university affiliation. Both <span className="font-medium">Students</span> and <span className="font-medium">Faculty</span> have access to the same reservation system features — including creating reservations, joining as participants, and viewing room availability. This role selection helps the library staff identify your affiliation during verification and approval processes.
</p>


  <p>
  <span className="font-semibold">How to verify your ID number:</span><br />
  After signing up, visit the library and send a photo of your official RFID card to <a href="mailto:circulation@usa.edu.ph" className="text-blue-600 hover:underline">circulation@usa.edu.ph</a>. The library staff will check and validate your ID. Once approved, your account will be activated, and your status will show <span className="font-medium text-green-600">“Verified”</span> when reserving or joining as a participant.
</p>

    <p>
      <span className="font-semibold">What to do if your account is blocked:</span><br />
      If you are blocked from making a reservation, it may be due to:
      <br />
      - Unverified account<br />
      - Already having a reservation on the same day<br />
      - Violation of reservation policies<br />
      If you believe this is a mistake, contact the admin through the <span className="font-medium text-blue-600">Messages</span> tab or visit the library staff for assistance.
    </p>
  </div>
</details>


          {/* Section 2 */}
<details className="border border-red-300 shadow-sm rounded-lg p-4">
  <summary className="font-medium cursor-pointer text-gray-800">
    Making a Reservation
  </summary>
  <div className="border-b border-gray-300 mt-3"></div>
  <div className="mt-2 text-sm text-gray-600 space-y-3 leading-relaxed">
<p>
  <span className="font-semibold">How to select a location and room:</span><br />
  On your dashboard, click the <span className="font-medium text-blue-600">“Reserve Room”</span> button. Start by choosing your desired date using the calendar. Then, select a location (e.g., Ground Floor, Second Floor) shown as image tiles. After selecting a floor, you can pick from the available rooms for that location.
</p>

<p>
  <span className="font-semibold">Date and time selection:</span><br />
  Select your reservation date first. Then choose your preferred time slot — reservations are limited to <span className="font-medium">one hour</span> per group per day. The system will automatically block time slots that are already reserved or overlapping.
</p>


    <p>
      <span className="font-semibold">Adding participants:</span><br />
      You are required to add at least 3 participants by entering their valid ID numbers. The system will verify if these participants exist and are eligible (verified). Duplicates or already-reserved users will not be accepted.
    </p>

    <p>
      <span className="font-semibold">Reservation limit: one per day:</span><br />
      Each user (whether main reserver or participant) is allowed only one active reservation per day. If you already have a reservation (Pending, Approved, Rejected, or Cancelled), you will not be able to create another until the next day.
    </p>

    <p>
      <span className="font-semibold">Why you may be blocked from reserving:</span><br />
      If you see a message saying you are blocked from reserving, it may be because:<br />
      - You already have a reservation on the same day<br />
      - Your account is not verified<br />
      - You were added as a participant in another reservation today<br />
      If unsure, check your reservation history or contact the admin via Messages.
    </p>
  </div>
</details>


          {/* Section 3 */}
<details className="border border-red-300 shadow-sm rounded-lg p-4">
  <summary className="font-medium cursor-pointer text-gray-800">
    Understanding Room Availability
  </summary>
  <div className="border-b border-gray-300 mt-3"></div>
  <div className="mt-2 text-sm text-gray-600 space-y-3 leading-relaxed">
    <p>
      <span className="font-semibold">How to check if a room is occupied:</span><br />
      On your dashboard, click a date on the calendar to open the Room Availability Checker. A modal will appear showing each room grouped by floor. If a room has existing reservations during that date and time, it will be marked as <span className="font-medium text-red-600">“Occupied”</span> along with the time ranges it is taken.
    </p>

    <p>
      <span className="font-semibold">What “Occupied” means:</span><br />
      A room is marked <span className="font-medium text-red-600">“Occupied”</span> if there is any reservation already submitted for that time, regardless of whether it's still pending or already approved. You will not be allowed to reserve overlapping time slots for rooms that are occupied.
    </p>

<p>
  <span className="font-semibold">Why a room is unavailable:</span><br />
  A room may be unavailable due to:<br />
  - An existing reservation that has been <span className="italic">approved</span><br />
  - The library is closed on the selected date<br />
  - The selected time is outside the operating hours<br />
  Always check availability before submitting a reservation request.
</p>



<p>
  <span className="font-semibold">Only approved reservations block the room:</span><br />
  A room is considered unavailable only if it already has an <span className="font-medium">Approved</span> reservation during the selected time slot. <span className="font-medium">Pending</span>, <span className="font-medium">Rejected</span>, or <span className="font-medium">Cancelled</span> reservations do <span className="font-medium text-red-600">not</span> block the room and will not affect availability.
</p>


  </div>
</details>


          {/* Section 4 */}
<details className="border border-red-300 shadow-sm rounded-lg p-4">
  <summary className="font-medium cursor-pointer text-gray-800">
    Reservation Status & Actions
  </summary>
  <div className="border-b border-gray-300 mt-3"></div>
  <div className="mt-2 text-sm text-gray-600 space-y-3 leading-relaxed">
    <p>
      <span className="font-semibold">What Pending, Approved, Rejected mean:</span><br />
      - <span className="text-yellow-600 font-medium">Pending</span>: Your reservation has been submitted and is awaiting admin approval. You cannot make another reservation until this is resolved.<br />
      - <span className="text-green-600 font-medium">Approved</span>: Your reservation was accepted and is officially scheduled. You may proceed to use the room at the specified time.<br />
      - <span className="text-red-600 font-medium">Rejected</span>: Your reservation was declined. You will need to submit a new request if needed. You are now allowed to reserve again for the same day.
    </p>

    <p>
      <span className="font-semibold">How to cancel your reservation:</span><br />
      Go to the <span className="font-medium text-blue-600">Dashboard</span> or <span className="font-medium text-blue-600">History</span> tab, find your active reservation, and click the <span className="font-medium">“Cancel”</span> button. A confirmation dialog will appear. Once cancelled, the slot becomes available again for others to reserve.
    </p>

    <p>
      <span className="font-semibold">Viewing past reservations:</span><br />
      All your current and previous reservations can be viewed in the <span className="font-medium text-blue-600">History</span> tab. Here you can see the reservation date, time, room, and status. This is useful for checking your past activity or following up on a pending request.
    </p>

    <p>
      <span className="font-semibold">Why your reservation was rejected:</span><br />
      Common reasons for rejection include:<br />
      - Duplicate reservation for the same day<br />
      - Invalid or unverified participants<br />
      - Attempting to reserve a time slot already occupied<br />
      - Violation of library or room guidelines<br />
      Check your email or notification tab for rejection details. You may contact the admin through the <span className="font-medium text-blue-600">Messages</span> tab if clarification is needed.
    </p>
  </div>
</details>


          {/* Section 5 */}
<details className="border border-red-300 shadow-sm rounded-lg p-4">
  <summary className="font-medium cursor-pointer text-gray-800">
    Notifications & Updates
  </summary>
  <div className="border-b border-gray-300 mt-3"></div>
  <div className="mt-2 text-sm text-gray-600 space-y-3 leading-relaxed">
    <p>
      <span className="font-semibold">How you get notified:</span><br />
      Every time your reservation status changes (e.g., Approved, Rejected, or Cancelled), the system will send you two types of notifications:<br />
      - A real-time update inside the <span className="font-medium text-blue-600">Notifications</span> tab on your dashboard.<br />
      - An email alert to the address you used when signing up.
    </p>

    <p>
      <span className="font-semibold">Where to view updates:</span><br />
      Go to the <span className="font-medium text-blue-600">Notifications</span> tab from the sidebar menu. Here, you’ll see a list of updates sorted by most recent. Each notification includes the reservation ID, room name, time, and the status update (e.g., “Your reservation has been approved”).
    </p>

    <p>
      <span className="font-semibold">Didn’t receive an email? Check your spam:</span><br />
      If you haven’t received an email update, check your spam or junk folder. Some university email systems may automatically filter unknown senders. Also, ensure that your registered email is correct in your <span className="font-medium text-blue-600">Profile</span> tab. If the issue persists, contact the admin via <span className="font-medium text-blue-600">Messages</span>.
    </p>
  </div>
</details>


          {/* Section 6 */}
<details className="border border-red-300 shadow-sm rounded-lg p-4">
  <summary className="font-medium cursor-pointer text-gray-800">
    Troubleshooting
  </summary>
  <div className="border-b border-gray-300 mt-3"></div>
  <div className="mt-2 text-sm text-gray-600 space-y-3 leading-relaxed">
<p>
  <span className="font-semibold">Reservation form not submitting:</span><br />
  Double-check that all required fields are filled out — especially the date, time, and participants. Make sure:<br />
  - You selected a room<br />
  - The time slot is available<br />
  - You added at least 3 valid participant ID numbers<br />
  If the form doesn’t respond or nothing happens after clicking submit, try refreshing the page and filling it out again. If the issue continues, contact the library staff for assistance.
</p>

    <p>
  <span className="font-semibold">Calendar not showing:</span><br />
  If the calendar doesn’t appear, try these steps:<br />
  - Refresh the page and wait a few seconds<br />
  - Try using a different browser like Chrome or Firefox<br />
  - Turn off incognito/private mode, if it’s on<br />
  - Disable any browser extensions that block pop-ups or scripts<br />
  If the problem continues, contact the library staff or send a message through the system.
</p>


    <p>
      <span className="font-semibold">Participants not verifying:</span><br />
      If a participant's ID doesn’t verify:<br />
      - Make sure the ID is typed correctly<br />
      - Ensure the participant has already signed up and is verified<br />
      - Do not reuse the same ID twice<br />
      If problems persist, contact the admin through the <span className="font-medium text-blue-600">Messages</span> tab for assistance.
    </p>

    <p>
      <span className="font-semibold">Can’t log in or forgot password:</span><br />
      Make sure you're entering the correct email and password. If you forgot your password, there’s no automated reset yet — contact the librarian or system admin through the <span className="font-medium text-blue-600">Messages</span> tab or visit in person to request a reset.
    </p>
  </div>
</details>


          {/* Section 7 */}
<details className="border border-red-300 shadow-sm rounded-lg p-4">
  <summary className="font-medium cursor-pointer text-gray-800">
    Frequently Asked Questions
  </summary>
  <div className="border-b border-gray-300 mt-3"></div>
  <div className="mt-2 text-sm text-gray-600 space-y-3 leading-relaxed">
    <p>
      <span className="font-semibold">Why can’t I reserve more than once today?</span><br />
      To maintain fairness and allow equal access to rooms, each user is limited to one reservation per day — whether you are the main reserver or added as a participant. This rule applies even if the reservation was rejected or canceled.
    </p>

    <p>
      <span className="font-semibold">Can participants reserve too?</span><br />
      Yes, participants can also reserve — but only if they haven’t already joined another reservation that day. Once you're involved in any reservation (even as a participant), the system will block you from creating or joining another on the same day.
    </p>

    <p>
      <span className="font-semibold">Why do I need to be verified?</span><br />
      Verification ensures that only legitimate University of San Agustin students and faculty use the system. Your ID must be verified before you can create a reservation or be added as a participant. Unverified accounts will not be allowed to reserve.
    </p>

    <p>
      <span className="font-semibold">What time ranges are allowed?</span><br />
      Reservation times follow the library’s open hours. You can choose hourly blocks within the allowed time range, but you cannot overlap existing reservations. The system will only accept valid time slots that do not conflict with others.
    </p>
  </div>
</details>


         {/* Section 8 */}
<details className="border border-red-300 shadow-sm rounded-lg p-4">
  <summary className="font-medium cursor-pointer text-gray-800">Contact</summary>
  <div className="border-b border-gray-300 mt-3"></div>
  <div className="mt-2 text-sm text-gray-600 space-y-3 leading-relaxed">
    <p>
      <span className="font-semibold">Contact admin through the Messages tab:</span><br />
      If you need help with account issues, reservation concerns, or system errors, go to the <span className="font-medium text-blue-600">Messages</span> tab in your dashboard. You can send a direct message to the system administrator or library staff. Replies will also appear there.
    </p>

    <p>
      <span className="font-semibold">Email:</span><br />
      For urgent matters, email us at <a href="mailto:support@yourdomain.com" className="text-blue-600 hover:underline">support@yourdomain.com</a>. Include your full name, ID number, and a clear description of your issue for faster assistance.
    </p>

    <p>
      <span className="font-semibold">Submit a request via contact form (if available):</span><br />
      If the website includes a contact form (check the homepage or footer), you may also submit support requests there. Make sure to include your contact information and a detailed explanation of the problem.
    </p>
  </div>
</details>

        </div>
      </div>
    </main>
  );
}
