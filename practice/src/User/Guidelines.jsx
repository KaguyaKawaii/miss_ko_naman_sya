import { useEffect, useState } from "react";
import axios from "axios";

function Guidelines({ user }) {
  return (
    <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col bg-white text-gray-800">
      {/* HEADER */}
      <header className=" text-black px-6 h-[60px] flex items-center justify-between shadow-sm">
  <h1 className="text-xl md:text-2xl font-bold tracking-wide">Guidelines</h1>
</header>

      {/* CONTENT */}
      <div className="p-8 flex-1 overflow-y-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            DISCUSSION / COLLABORATION ROOM GUIDELINES
          </h2>
          <div className="border m-5 border-gray-200"></div>
          <p className="text-lg font-medium leading-relaxed max-w-4xl mx-auto text-gray-700">
            The University of San Agustin Learning Resource Center Discussion Room / Collaboration Corner is a dedicated space for faculty, staff, and students to collaborate, study, and engage in productive academic endeavors. These guidelines help maintain a respectful, inclusive, and productive environment for all members of the Augustinian academic community.
          </p>
        </div>

        <div>
          <h3 className="text-xl md:text-2xl font-semibold mb-4">General Guidelines</h3>
          <ul className="list-disc pl-6 space-y-3 text-gray-700">
            <li>Discussion/Collaboration Rooms are reserved for legitimate University of San Agustin faculty, staff, and students for academic purposes.</li>
            <li>Room usage is limited to a minimum of four (4) and a maximum of eight (8) users per group.</li>
            <li>Only a group representative may make the reservation.</li>
            <li>Users must fill out the Discussion/Collaboration Room Request Form and present their Faculty ID to the library staff before using the room.</li>
            <li>The assigned librarian will provide the key, remote control, and turn on the electricity prior to use.</li>
            <li>The room is available on a first-come, first-served basis.</li>
            <li>Access is granted only if at least four (4) group members are physically present at the reservation time.</li>
            <li>Only one (1) reservation per day is allowed, and no more than two (2) reservations per group per week.</li>
            <li>Reservations must be made through the librarian up to one day before the intended date of use.</li>
            <li>The group will be notified 15 minutes before their time ends. If no reservation follows, a one-hour extension may be requested.</li>
            <li>The Learning Resource Center may cancel any reservation if the group does not arrive within 15 minutes of the reserved time.</li>
            <li>Food and drinks are strictly prohibited inside the room.</li>
            <li>Users must bring their own materials such as markers, pens, and paper.</li>
            <li>Furniture must not be added, removed, or rearranged.</li>
            <li>The library is not responsible for lost or unattended personal items.</li>
            <li>
              The following are prohibited in the room:
              <ul className="pl-6 mt-2 space-y-1">
                <li><span className="font-semibold">a.</span> Posting of visual aids</li>
                <li><span className="font-semibold">b.</span> Playing board games</li>
                <li><span className="font-semibold">c.</span> Gambling</li>
                <li><span className="font-semibold">d.</span> Creating projects involving printing, cutting, etc.</li>
                <li><span className="font-semibold">e.</span> Vandalism of any kind</li>
              </ul>
            </li>
            <li>Users are responsible for any damages or losses in the room during their reservation.</li>
            <li>The room is for academic use only. Formal classes should not be held here.</li>
            <li>Rooms must be vacated 15 minutes before the library closes.</li>
            <li>These guidelines are subject to change without prior notice. All users must follow the Learning Resource Center’s policies.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

export default Guidelines;
