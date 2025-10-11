import { useEffect, useState } from "react";
import axios from "axios";

function Guidelines({ user }) {
  return (
    <main className="ml-0 lg:ml-[250px] w-full lg:w-[calc(100%-250px)] min-h-screen flex flex-col bg-white text-gray-800">
      {/* HEADER */}
      <header className="text-black px-4 sm:px-6 h-[60px] flex items-center justify-between shadow-sm border-b border-gray-200">
        <h1 className="text-xl md:text-2xl font-bold tracking-wide">Guidelines</h1>
      </header>

      {/* CONTENT */}
      <div className="p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto space-y-6 max-w-7xl mx-auto w-full">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-gray-900">
            DISCUSSION / COLLABORATION ROOM GUIDELINES
          </h2>
          <div className="border border-gray-300 mx-auto max-w-4xl my-4 sm:my-6"></div>
          <p className="text-base sm:text-lg font-medium leading-relaxed max-w-4xl mx-auto text-gray-700 bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm">
            The University of San Agustin Learning Resource Center Discussion Room / Collaboration Corner is a dedicated space for faculty, staff, and students to collaborate, study, and engage in productive academic endeavors. These guidelines help maintain a respectful, inclusive, and productive environment for all members of the Augustinian academic community.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-gray-900">General Guidelines</h3>
          <ul className="space-y-4 text-gray-700">
            <li className="flex items-start">
              <span className="text-red-500 mr-3 flex-shrink-0">•</span>
              <span>Discussion/Collaboration Rooms are reserved for legitimate University of San Agustin faculty, staff, and students for academic purposes.</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-3 flex-shrink-0">•</span>
              <span>Room usage is limited to a minimum of four (4) and a maximum of eight (8) users per group.</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-3 flex-shrink-0">•</span>
              <span>Only a group representative may make the reservation.</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-3 flex-shrink-0">•</span>
              <span>Users must fill out the Discussion/Collaboration Room Request Form and present their Faculty ID to the library staff before using the room.</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-3 flex-shrink-0">•</span>
              <span>The assigned librarian will provide the key, remote control, and turn on the electricity prior to use.</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-3 flex-shrink-0">•</span>
              <span>The room is available on a first-come, first-served basis.</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-3 flex-shrink-0">•</span>
              <span>Access is granted only if at least four (4) group members are physically present at the reservation time.</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-3 flex-shrink-0">•</span>
              <span>Only one (1) reservation per day is allowed, and no more than two (2) reservations per group per week.</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-3 flex-shrink-0">•</span>
              <span>Reservations must be made through the librarian up to one day before the intended date of use.</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-3 flex-shrink-0">•</span>
              <span>The group will be notified 15 minutes before their time ends. If no reservation follows, a one-hour extension may be requested.</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-3 flex-shrink-0">•</span>
              <span>The Learning Resource Center may cancel any reservation if the group does not arrive within 15 minutes of the reserved time.</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-3 flex-shrink-0">•</span>
              <span>Food and drinks are strictly prohibited inside the room.</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-3 flex-shrink-0">•</span>
              <span>Users must bring their own materials such as markers, pens, and paper.</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-3 flex-shrink-0">•</span>
              <span>Furniture must not be added, removed, or rearranged.</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-3 flex-shrink-0">•</span>
              <span>The library is not responsible for lost or unattended personal items.</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-3 flex-shrink-0">•</span>
              <div className="w-full">
                <span className="block mb-2">The following are prohibited in the room:</span>
                <ul className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 space-y-2">
                  <li className="flex items-start">
                    <span className="font-semibold text-red-700 mr-2 min-w-[20px]">a.</span>
                    <span>Posting of visual aids</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold text-red-700 mr-2 min-w-[20px]">b.</span>
                    <span>Playing board games</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold text-red-700 mr-2 min-w-[20px]">c.</span>
                    <span>Gambling</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold text-red-700 mr-2 min-w-[20px]">d.</span>
                    <span>Creating projects involving printing, cutting, etc.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold text-red-700 mr-2 min-w-[20px]">e.</span>
                    <span>Vandalism of any kind</span>
                  </li>
                </ul>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-3 flex-shrink-0">•</span>
              <span>Users are responsible for any damages or losses in the room during their reservation.</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-3 flex-shrink-0">•</span>
              <span>The room is for academic use only. Formal classes should not be held here.</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-3 flex-shrink-0">•</span>
              <span>Rooms must be vacated 15 minutes before the library closes.</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-3 flex-shrink-0">•</span>
              <span>These guidelines are subject to change without prior notice. All users must follow the Learning Resource Center's policies.</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}

export default Guidelines;