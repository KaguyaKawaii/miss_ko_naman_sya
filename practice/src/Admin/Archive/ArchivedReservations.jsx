import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavigation from "../AdminNavigation";

function AdminArchived({ setView }) {
  const [archivedReservations, setArchivedReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch archived reservations
  const fetchArchivedReservations = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/reservations/archived");
      setArchivedReservations(res.data);
    } catch (err) {
      console.error("Failed to fetch archived reservations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedReservations();
  }, []);

  // Restore reservation
  const handleRestore = async (id) => {
    try {
      await axios.put(`http://localhost:5000/reservations/restore/${id}`);
      alert("Reservation restored successfully.");

      // Refresh archived list
      fetchArchivedReservations();

      // 🔑 Tell AdminReservations to refresh
      window.dispatchEvent(new Event("reservationRestored"));
    } catch (err) {
      console.error("Failed to restore reservation:", err);
      alert("Failed to restore reservation.");
    }
  };

  // Permanently delete reservation
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this reservation?")) return;
    try {
      await axios.delete(`http://localhost:5000/reservations/archived/${id}`);
      alert("Reservation permanently deleted.");
      fetchArchivedReservations();
    } catch (err) {
      console.error("Failed to delete reservation:", err);
      alert("Failed to delete reservation.");
    }
  };

  // Calculate duration between start and end time
  const calculateDuration = (start, end) => {
    if (!start || !end) return "N/A";
    const diffMs = new Date(end) - new Date(start);
    if (diffMs <= 0) return "N/A";
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours >= 24) return `${Math.round(hours / 24)} day(s)`;
    if (hours > 0) return `${hours} hr ${minutes} min`;
    return `${minutes} min`;
  };

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
            {loading ? (
              <p className="text-gray-500">Loading archived reservations...</p>
            ) : archivedReservations.length === 0 ? (
              <p className="text-gray-500">No archived reservations found.</p>
            ) : (
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
                      <tr
                        key={reservation._id}
                        className="border-b border-gray-200 hover:bg-gray-50 duration-150"
                      >
                        <td className="p-3">{reservation._id}</td>
                        <td className="p-3 font-medium">{reservation.roomName}</td>
                        <td className="p-3">{reservation.userId?.name}</td>
                        <td className="p-3">
                          {reservation.datetime
                            ? new Date(reservation.datetime).toLocaleDateString("en-PH", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="p-3">
                          {calculateDuration(reservation.datetime, reservation.endDatetime)}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              reservation.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : reservation.status === "Cancelled" ||
                                  reservation.status === "Rejected"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {reservation.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {reservation.archivedAt
                            ? new Date(reservation.archivedAt).toLocaleDateString("en-PH", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleRestore(reservation._id)}
                            className="text-[#CC0000] hover:underline mr-3"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => handleDelete(reservation._id)}
                            className="text-gray-600 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default AdminArchived;
