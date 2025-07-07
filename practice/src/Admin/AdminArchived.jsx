import React from "react";
import AdminNavigation from "./AdminNavigation";

function AdminArchived({ setView }) {
  // Sample archived reservation data
  const archivedReservations = [
    { id: 1, room: "Graduate Hub Research", user: "Stephen P. Madero Jr.", date: "June 15, 2025", duration: "2 hours", status: "Completed", archivedDate: "July 1, 2025" },
    { id: 2, room: "Faculty Hub", user: "Suheila Belle Morales", date: "June 18, 2025", duration: "4 hours", status: "Canceled", archivedDate: "July 1, 2025" },
    { id: 3, room: "Collaboration Room", user: "Louis Miguel Parreno", date: "June 20, 2025", duration: "1 day", status: "No-show", archivedDate: "June 30, 2025" },
    { id: 4, room: "Graduate Hub Research", user: "Patrick Miguel Andrade", date: "June 22, 2025", duration: "3 hours", status: "Completed", archivedDate: "June 29, 2025" },
    { id: 5, room: "Faculty Room", user: "Stephen P. Madero Jr.", date: "June 25, 2025", duration: "1 hour", status: "Canceled", archivedDate: "June 28, 2025" },
    { id: 6, room: "Ground Floor", user: "Suheila Belle Morales", date: "June 28, 2025", duration: "6 hours", status: "Completed", archivedDate: "June 28, 2025" },
    { id: 7, room: "Graduate Hub Research", user: "Louis Miguel Parreno", date: "May 15, 2025", duration: "2 hours", status: "Completed", archivedDate: "June 25, 2025" },
    { id: 8, room: "Graduate Hub Research", user: "Patrick Miguel Andrade", date: "May 18, 2025", duration: "4 hours", status: "Completed", archivedDate: "June 25, 2025" },
    { id: 9, room: "Discussion Room", user: "Stephen P. Madero Jr.", date: "May 20, 2025", duration: "3 hours", status: "Canceled", archivedDate: "June 20, 2025" },
    { id: 10, room: "Discussion Room", user: "Suheila Belle Morales", date: "May 22, 2025", duration: "1 hour", status: "Completed", archivedDate: "June 20, 2025" },
    { id: 11, room: "Faculty Room", user: "Louis Miguel Parreno", date: "May 25, 2025", duration: "1 day", status: "Completed", archivedDate: "June 15, 2025" },
    { id: 12, room: "Discussion Room", user: "Patrick Miguel Andrade", date: "May 28, 2025", duration: "2 hours", status: "No-show", archivedDate: "June 15, 2025" },
  ];

  return (
    <>
      <AdminNavigation setView={setView} currentView="adminArchived" />
      <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gray-50">
        <header className="bg-white px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-[#CC0000]">Archived Reservations</h1>
          <p className="text-gray-600">View and manage archived reservation records</p>
        </header>
        <div className="p-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[calc(100vh-180px)] overflow-y-auto">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Room</th>
                    <th className="p-3 text-left">User</th>
                    <th className="p-3 text-left">Reservation Date</th>
                    <th className="p-3 text-left">Duration</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Archived On</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {archivedReservations.map((reservation) => (
                    <tr key={reservation.id} className="border-b border-gray-200 hover:bg-gray-50 duration-150">
                      <td className="p-3">{reservation.id}</td>
                      <td className="p-3 font-medium">{reservation.room}</td>
                      <td className="p-3">{reservation.user}</td>
                      <td className="p-3">{reservation.date}</td>
                      <td className="p-3">{reservation.duration}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          reservation.status === "Completed" ? "bg-green-100 text-green-800" :
                          reservation.status === "Canceled" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {reservation.status}
                        </span>
                      </td>
                      <td className="p-3">{reservation.archivedDate}</td>
                      <td className="p-3">
                        <button className="text-[#CC0000] hover:underline mr-3">
                          Restore
                        </button>
                        <button className="text-gray-600 hover:underline">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default AdminArchived;