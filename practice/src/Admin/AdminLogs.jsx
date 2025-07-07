import React from "react";
import AdminNavigation from "./AdminNavigation";

function AdminLogs({ setView }) {
  return (
    <>
      <AdminNavigation setView={setView} currentView="adminLogs" />
      <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gray-50">
        <header className="bg-white px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-[#CC0000]">Activity Logs</h1>
          <p className="text-gray-600">Review user and system activities</p>
        </header>
        <div className="p-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[calc(100vh-180px)] overflow-y-auto">
            <ul className="space-y-3 text-sm text-gray-700">
              <li><strong>Stephen P. Madero Jr.</strong> reserved Room 302 at 9:00 AM · July 7, 2025</li>
              <li><strong>Suheila Belle Morales</strong> canceled reservation for Room 101 · July 7, 2025</li>
              <li><strong>Louis Miguel Parreno</strong> updated profile picture · July 7, 2025</li>
              <li><strong>Patrick Miguel Andrade</strong> submitted a room reservation · July 7, 2025</li>
              <li><strong>Stephen P. Madero Jr.</strong> changed password · July 6, 2025</li>
              <li><strong>Suheila Belle Morales</strong> viewed reservation history · July 6, 2025</li>
              <li><strong>Louis Miguel Parreno</strong> logged in · July 6, 2025</li>
              <li><strong>Patrick Miguel Andrade</strong> logged out · July 6, 2025</li>
              <li><strong>Stephen P. Madero Jr.</strong> submitted a maintenance report · July 6, 2025</li>
              <li><strong>Suheila Belle Morales</strong> joined as a participant in Room 402 · July 5, 2025</li>
              <li><strong>Louis Miguel Parreno</strong> deleted a reservation request · July 5, 2025</li>
              <li><strong>Patrick Miguel Andrade</strong> received account verification · July 5, 2025</li>
              <li><strong>Stephen P. Madero Jr.</strong> edited user profile · July 4, 2025</li>
              <li><strong>Suheila Belle Morales</strong> viewed guidelines page · July 4, 2025</li>
              <li><strong>Louis Miguel Parreno</strong> was added as admin · July 4, 2025</li>
              <li><strong>Patrick Miguel Andrade</strong> reported a projector issue on 3rd floor · July 3, 2025</li>
              <li><strong>Stephen P. Madero Jr.</strong> uploaded a profile photo · July 3, 2025</li>
              <li><strong>Suheila Belle Morales</strong> removed profile picture · July 3, 2025</li>
              <li><strong>Louis Miguel Parreno</strong> changed department from IT to CS · July 2, 2025</li>
              <li><strong>Patrick Miguel Andrade</strong> viewed dashboard · July 2, 2025</li>
              <li><strong>Stephen P. Madero Jr.</strong> updated contact information · July 2, 2025</li>
              <li><strong>Suheila Belle Morales</strong> requested password reset · July 1, 2025</li>
              <li><strong>Louis Miguel Parreno</strong> created a new event · July 1, 2025</li>
              <li><strong>Patrick Miguel Andrade</strong> joined the newsletter · July 1, 2025</li>
              <li><strong>Stephen P. Madero Jr.</strong> approved room reservation · June 30, 2025</li>
              <li><strong>Suheila Belle Morales</strong> declined meeting invitation · June 30, 2025</li>
              <li><strong>Louis Miguel Parreno</strong> uploaded document to shared drive · June 30, 2025</li>
              <li><strong>Patrick Miguel Andrade</strong> marked task as complete · June 29, 2025</li>
              <li><strong>Stephen P. Madero Jr.</strong> scheduled weekly meeting · June 29, 2025</li>
              <li><strong>Suheila Belle Morales</strong> shared calendar availability · June 29, 2025</li>
              <li><strong>Louis Miguel Parreno</strong> updated system settings · June 28, 2025</li>
              <li><strong>Patrick Miguel Andrade</strong> sent feedback to admin · June 28, 2025</li>
              <li><strong>Stephen P. Madero Jr.</strong> created new user group · June 28, 2025</li>
              <li><strong>Suheila Belle Morales</strong> changed notification preferences · June 27, 2025</li>
              <li><strong>Louis Miguel Parreno</strong> archived old projects · June 27, 2025</li>
              <li><strong>Patrick Miguel Andrade</strong> upgraded account tier · June 27, 2025</li>
              <li><strong>Stephen P. Madero Jr.</strong> exported user data · June 26, 2025</li>
              <li><strong>Suheila Belle Morales</strong> imported contact list · June 26, 2025</li>
              <li><strong>Louis Miguel Parreno</strong> set out of office status · June 26, 2025</li>
              <li><strong>Patrick Miguel Andrade</strong> completed onboarding · June 25, 2025</li>
              <li><strong>Stephen P. Madero Jr.</strong> renewed subscription · June 25, 2025</li>
              <li><strong>Suheila Belle Morales</strong> verified email address · June 25, 2025</li>
              <li><strong>Louis Miguel Parreno</strong> enabled two-factor authentication · June 24, 2025</li>
              <li><strong>Patrick Miguel Andrade</strong> disabled email notifications · June 24, 2025</li>
              <li><strong>Stephen P. Madero Jr.</strong> created new workspace · June 24, 2025</li>
              <li><strong>Suheila Belle Morales</strong> invited team members · June 23, 2025</li>
              <li><strong>Louis Miguel Parreno</strong> updated billing information · June 23, 2025</li>
              <li><strong>Patrick Miguel Andrade</strong> downloaded resources · June 23, 2025</li>
              <li><strong>Stephen P. Madero Jr.</strong> started video conference · June 22, 2025</li>
              <li><strong>Suheila Belle Morales</strong> ended video conference · June 22, 2025</li>
              <li><strong>Louis Miguel Parreno</strong> shared screen · June 22, 2025</li>
              <li><strong>Patrick Miguel Andrade</strong> recorded meeting · June 21, 2025</li>
              <li><strong>Stephen P. Madero Jr.</strong> pinned important message · June 21, 2025</li>
              <li><strong>Suheila Belle Morales</strong> starred conversation · June 21, 2025</li>
              <li><strong>Louis Miguel Parreno</strong> muted notifications · June 20, 2025</li>
              <li><strong>Patrick Miguel Andrade</strong> unmuted notifications · June 20, 2025</li>
              <li><strong>Stephen P. Madero Jr.</strong> created poll · June 20, 2025</li>
              <li><strong>Suheila Belle Morales</strong> voted in poll · June 19, 2025</li>
              <li><strong>Louis Miguel Parreno</strong> closed poll · June 19, 2025</li>
              <li><strong>Patrick Miguel Andrade</strong> archived channel · June 19, 2025</li>
              <li><strong>Stephen P. Madero Jr.</strong> restored deleted item · June 18, 2025</li>
              <li><strong>Suheila Belle Morales</strong> permanently deleted item · June 18, 2025</li>
              <li><strong>Louis Miguel Parreno</strong> changed theme to dark mode · June 18, 2025</li>
              <li><strong>Patrick Miguel Andrade</strong> changed theme to light mode · June 17, 2025</li>
              <li><strong>Stephen P. Madero Jr.</strong> customized dashboard · June 17, 2025</li>
              <li><strong>Suheila Belle Morales</strong> reset dashboard layout · June 17, 2025</li>
              <li><strong>Louis Miguel Parreno</strong> created custom report · June 16, 2025</li>
              <li><strong>Patrick Miguel Andrade</strong> scheduled report delivery · June 16, 2025</li>
              <li><strong>Stephen P. Madero Jr.</strong> edited document · June 16, 2025</li>
              <li><strong>Suheila Belle Morales</strong> commented on document · June 15, 2025</li>
              <li><strong>Louis Miguel Parreno</strong> resolved comment · June 15, 2025</li>
              <li><strong>Patrick Miguel Andrade</strong> requested edit access · June 15, 2025</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}

export default AdminLogs;