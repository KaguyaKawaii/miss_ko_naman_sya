// import yelanPicture from "../assets/yelanpicture.png";

// function AdminNotification() {
//   return (
//     <div className="ml-[250px] w-[calc(100%-250px)] h-screen relative flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm overflow-hidden">
//       {/* Centered Maintenance Message */}
//       <div className="text-center max-w-md z-10 px-4">
//         {/* Warning Icon */}
//         <div className="flex justify-center items-center mb-6">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             width="64"
//             height="64"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="#CC0000"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             className="animate-pulse"
//           >
//             <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
//             <line x1="12" y1="9" x2="12" y2="13" />
//             <line x1="12" y1="17" x2="12.01" y2="17" />
//           </svg>
//         </div>

//         {/* Title */}
//         <h1 className="text-3xl font-bold text-gray-800 mb-3">
//           Under Maintenance
//         </h1>

//         {/* Message */}
//         <p className="text-gray-600 mb-6 leading-relaxed">
// "The system is temporarily unavailable due to scheduled maintenance by the admin."   
//      </p>

       
        
//       </div>

//       {/* Yelan Pictures - Bottom Right */}
//       {/* <div className="absolute bottom-0 flex">
//         <img
//           src={yelanPicture}
//           alt="Yelan 1"
//           className="w-[50rem] h-[50rem] object-contain"
//         />
//         <img
//   src={yelanPicture}
//   alt="Yelan 2"
//   className="w-[50rem] h-[50rem] object-contain scale-x-[-1]"
// />

//       </div> */}
//     </div>
//   );
// }

// export default AdminNotification;

import React from "react";
import AdminNavigation from "./AdminNavigation";

function AdminNotification({ setView }) {
  // Sample notification data
  const notifications = [
    {
      id: 1,
      type: "reservation",
      user: "Stephen P. Madero Jr.",
      message: "has requested to reserve Graduate Hub Research for 2 hours",
      time: "2 minutes ago",
      read: false
    },
    {
      id: 2,
      type: "cancellation",
      user: "Suheila Belle Morales",
      message: "has canceled their reservation for Collaboration Room",
      time: "15 minutes ago",
      read: false
    },
    {
      id: 3,
      type: "update",
      user: "Louis Miguel Parreno",
      message: "has updated their profile information",
      time: "1 hour ago",
      read: true
    },
    {
      id: 4,
      type: "report",
      user: "Patrick Miguel Andrade",
      message: "has submitted a maintenance report for Projector in Faculty Room",
      time: "3 hours ago",
      read: true
    },
    {
      id: 5,
      type: "system",
      message: "Scheduled maintenance will occur tonight from 10PM to 2AM",
      time: "5 hours ago",
      read: true
    },
    {
      id: 6,
      type: "reservation",
      user: "Stephen P. Madero Jr.",
      message: "has approved Graduate Hub Research reservation for Suheila Belle Morales",
      time: "Yesterday",
      read: true
    },
    {
      id: 7,
      type: "reminder",
      user: "Louis Miguel Parreno",
      message: "has an upcoming reservation for Faculty Room in 30 minutes",
      time: "Yesterday",
      read: true
    },
    {
      id: 8,
      type: "system",
      message: "New feature update: Added bulk reservation approval",
      time: "2 days ago",
      read: true
    },
  ];

  return (
    <>
      <AdminNavigation setView={setView} currentView="adminNotifications" />
      <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gray-50">
        <header className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#CC0000]">Notifications</h1>
              <p className="text-gray-600">Recent system and user activities</p>
            </div>
            <button className="text-[#CC0000] hover:underline">
              Mark all as read
            </button>
          </div>
        </header>
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Notification Filters */}
            <div className="border-b border-gray-200 p-4 bg-gray-50">
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-[#CC0000] text-white rounded-lg text-sm">
                  All
                </button>
                <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm">
                  Unread
                </button>
                <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm">
                  Reservations
                </button>
                <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm">
                  System
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <ul className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <li 
                  key={notification.id} 
                  className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start">
                    {/* Notification Icon */}
                    <div className="flex-shrink-0 mr-3 mt-1">
                      {notification.type === "reservation" && (
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      {notification.type === "cancellation" && (
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                      {notification.type === "update" && (
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                      )}
                      {notification.type === "system" && (
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">
                        {notification.user && (
                          <span className="font-semibold">{notification.user} </span>
                        )}
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>

                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="ml-2 flex-shrink-0">
                        <span className="w-2 h-2 rounded-full bg-[#CC0000] block"></span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* View All Button */}
            <div className="p-4 border-t border-gray-200 text-center">
              <button className="text-[#CC0000] hover:underline text-sm font-medium">
                View all notifications
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default AdminNotification;
