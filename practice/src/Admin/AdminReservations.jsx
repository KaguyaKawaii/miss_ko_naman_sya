import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminNavigation from "./AdminNavigation";
import { Eye, Trash2, RefreshCcw, Search } from "lucide-react";

function AdminReservations({ setView }) {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [modalRes, setModalRes] = useState(null);

  const formatPHDateTime = (date) =>
    date
      ? new Date(date).toLocaleString("en-PH", {
          timeZone: "Asia/Manila",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "—";

  const formatPHDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-PH", {
          timeZone: "Asia/Manila",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "—";

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = () => {
    setIsLoading(true);
    axios
      .get("http://localhost:5000/reservations")
      .then((res) => {
        const sorted = res.data.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt) : 0;
          const bTime = b.createdAt ? new Date(b.createdAt) : 0;
          return bTime - aTime;
        });
        setReservations(sorted);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

 const handleStatusChange = (id, newStatus) => {
    if (
      newStatus === "Rejected" &&
      !window.confirm("Are you sure to reject this reservation?")
    ) return;

    axios.put(`http://localhost:5000/reservations/${id}`, { status: newStatus })
      .then(() => {
        alert(`Reservation ${newStatus}. Notification sent.`);
        fetchReservations();
        setModalRes(null);

        // ✅ Trigger calendar availability refresh if callback is provided
        if (onReservationUpdated) onReservationUpdated();
      })
      .catch((err) => console.error(err));
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this reservation?")) {
      axios
        .delete(`http://localhost:5000/reservations/${id}`)
        .then(() => fetchReservations())
        .catch((err) => console.error(err));
    }
  };

  const filteredReservations = reservations.filter((res) => {
    const reserver = res.userId?.name || "";
    const matchesStatus = filter === "All" || res.status === filter;
    const matchesSearch =
      reserver.toLowerCase().includes(search.toLowerCase()) ||
      (res.roomName || "").toLowerCase().includes(search.toLowerCase()) ||
      (res.location || "").toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <AdminNavigation setView={setView} currentView="adminReservation" />
      <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">
        <header className="bg-[#CC0000] text-white pl-5 h-[50px] flex items-center">
          <h1 className="text-2xl font-semibold">Reservation Management</h1>
        </header>

        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          <div className="flex gap-3 items-center">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, room, location…"
                className="border border-gray-300 p-2 pr-10 rounded-lg w-64"
              />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <button
              onClick={fetchReservations}
              className="bg-[#CC0000] text-white p-2 rounded-lg hover:bg-[#990000]"
            >
              <RefreshCcw size={16} />
            </button>
          </div>

          <div className="border border-gray-300 rounded-xl overflow-hidden">
            <table className="w-full text-sm text-center">
              <thead className="bg-[#CC0000] text-white">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Room</th>
                  <th className="p-3">Reserved By</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created At</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center p-4">Loading…</td>
                  </tr>
                ) : filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-4">No reservations found.</td>
                  </tr>
                ) : (
                  filteredReservations.map((r, i) => {
                    const createdAt = r.createdAt ? new Date(r.createdAt) : null;
                    const startDate = new Date(r.datetime);
                    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

                    const dateOnly = startDate.toLocaleDateString("en-PH", {
                      timeZone: "Asia/Manila",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });

                    const startTime = startDate.toLocaleTimeString("en-PH", {
                      timeZone: "Asia/Manila",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    });

                    const endTime = endDate.toLocaleTimeString("en-PH", {
                      timeZone: "Asia/Manila",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    });

                    return (
                      <tr key={r._id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3">{i + 1}</td>
                        <td className="p-3">{dateOnly}</td>
                        <td className="p-3">{startTime} — {endTime}</td>
                        <td className="p-3">{r.roomName}<br />{r.location}</td>
                        <td className="p-3">{r.userId?.name}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              r.status === "Approved"
                                ? "bg-green-100 text-green-800"
                                : r.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3">{createdAt ? formatPHDateTime(createdAt) : "—"}</td>
                        <td className="p-3 flex gap-3 justify-center">
                          <Eye size={18} className="cursor-pointer text-blue-600 hover:text-blue-800"
                            onClick={() => setModalRes(r)} />
                          <Trash2 size={18} className="cursor-pointer text-gray-600 hover:text-gray-800"
                            onClick={() => handleDelete(r._id)} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {modalRes && (
        <ReservationModal
          reservation={modalRes}
          formatPHDateTime={formatPHDateTime}
          formatPHDate={formatPHDate}
          onClose={() => setModalRes(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
}

function ReservationModal({ reservation, formatPHDateTime, formatPHDate, onClose, onStatusChange }) {
  const {
    _id,
    userId,
    roomName,
    location,
    datetime,
    numUsers,
    purpose,
    participants = [],
    status,
    createdAt,
  } = reservation;

  const startDate = new Date(datetime);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  const startTime = startDate.toLocaleTimeString("en-PH", {
    timeZone: "Asia/Manila",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const endTime = endDate.toLocaleTimeString("en-PH", {
    timeZone: "Asia/Manila",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[500px] max-h-[90vh] rounded-xl shadow-xl overflow-y-auto">
        <header className="flex justify-between items-center bg-[#CC0000] text-white px-5 py-3 rounded-t-xl">
          <h2 className="text-lg font-semibold">Reservation Details</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
        </header>

        <div className="p-6 space-y-3 text-sm">
          <p><strong>Reserved By:</strong> {userId?.name}</p>
          <p><strong>Email:</strong> {userId?.email}</p>
          <p><strong>Room:</strong> {roomName} @ {location}</p>
          <p><strong>Reserved Date:</strong> {formatPHDate(datetime)}</p>
          <p><strong>Time:</strong> {startTime} — {endTime}</p>
          <p><strong>Number of Users:</strong> {numUsers}</p>
          <p><strong>Purpose:</strong> {purpose}</p>
          <p><strong>Status:</strong> {status}</p>
          <p><strong>Created At:</strong> {formatPHDateTime(createdAt)}</p>


          {participants.length > 0 && (
            <div>
              <p className="font-semibold">Participants:</p>
              <ul className="list-disc list-inside space-y-1">
                {participants.map((p, idx) => (
                  <li key={idx}>{p.name} — {p.courseYear}, {p.department} ({p.idNumber})</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-5 flex flex-wrap gap-2 justify-end">
          {status === "Pending" && (
            <>
              <button
                onClick={() => onStatusChange(_id, "Approved")}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => onStatusChange(_id, "Rejected")}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminReservations;
