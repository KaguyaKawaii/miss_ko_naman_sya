import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminNavigation from "./AdminNavigation";
import { Eye, Trash2, RefreshCw, Search, ChevronDown, X } from "lucide-react";

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
      .catch((err) => console.error("Fetch reservations error:", err))
      .finally(() => setIsLoading(false));
  };

  const handleStatusChange = (id, newStatus) => {
    if (
      newStatus === "Rejected" &&
      !window.confirm("Are you sure you want to reject this reservation?")
    )
      return;

    axios
      .put(`http://localhost:5000/reservations/${id}`, { status: newStatus })
      .then(() => {
        alert(`Reservation ${newStatus}. Notification sent.`);
        fetchReservations();
        setModalRes(null);
      })
      .catch((err) => console.error("Status change error:", err));
  };

  const handleArchive = (id) => {
    if (window.confirm("Archive this reservation?")) {
      axios
        .delete(`http://localhost:5000/reservations/${id}`)
        .then(() => {
          alert("Reservation archived.");
          fetchReservations();
        })
        .catch((err) => console.error("Archive error:", err));
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
      <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#CC0000]">
                Reservation Management
              </h1>
              <p className="text-gray-600">
                View and manage all room reservations
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, room, location..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Status filter */}
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="appearance-none pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={16}
                />
              </div>

              {/* Refresh */}
              <button
                onClick={fetchReservations}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={16} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Reservations Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">#</th>
                    <th className="px-6 py-3 text-left font-medium">Date</th>
                    <th className="px-6 py-3 text-left font-medium">Time</th>
                    <th className="px-6 py-3 text-left font-medium">Room</th>
                    <th className="px-6 py-3 text-left font-medium">
                      Reserved By
                    </th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-left font-medium">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        Loading reservations...
                      </td>
                    </tr>
                  ) : filteredReservations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No reservations found
                      </td>
                    </tr>
                  ) : (
                    filteredReservations.map((r, i) => {
                      const createdAt = r.createdAt
                        ? new Date(r.createdAt)
                        : null;
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
                        <tr key={r._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">{i + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{dateOnly}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {startTime} — {endTime}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium">{r.roomName}</div>
                            <div className="text-gray-500 text-xs">{r.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{r.userId?.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            {createdAt ? formatPHDateTime(createdAt) : "—"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end space-x-2">
                              {/* View */}
                              <button
                                onClick={() => setModalRes(r)}
                                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                title="View Details"
                              >
                                <Eye size={18} />
                              </button>
                              {/* Archive */}
                              <button
                                onClick={() => handleArchive(r._id)}
                                className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                                title="Archive"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Reservation Details Modal */}
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

function ReservationModal({
  reservation,
  formatPHDateTime,
  formatPHDate,
  onClose,
  onStatusChange,
}) {
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
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden">
        <header className="flex justify-between items-center bg-white px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Reservation Details
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </header>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Reserved By</h3>
              <p className="mt-1 text-gray-800">{userId?.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1 text-gray-800">{userId?.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Room</h3>
              <p className="mt-1 text-gray-800">
                {roomName} @ {location}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Reserved Date
              </h3>
              <p className="mt-1 text-gray-800">{formatPHDate(datetime)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Time</h3>
              <p className="mt-1 text-gray-800">
                {startTime} — {endTime}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Number of Users
              </h3>
              <p className="mt-1 text-gray-800">{numUsers}</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500">Purpose</h3>
              <p className="mt-1 text-gray-800">{purpose}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p className="mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    status === "Approved"
                      ? "bg-green-100 text-green-800"
                      : status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {status}
                </span>
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created At</h3>
              <p className="mt-1 text-gray-800">{formatPHDateTime(createdAt)}</p>
            </div>
          </div>

          {participants.length > 0 && (
            <div className="pt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Participants
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="space-y-2">
                  {participants.map((p, idx) => (
                    <li key={idx} className="text-sm text-gray-800">
                      <span className="font-medium">{p.name}</span> —{" "}
                      {p.courseYear}, {p.department} ({p.idNumber})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          {status === "Pending" && (
            <>
              <button
                onClick={() => onStatusChange(_id, "Approved")}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => onStatusChange(_id, "Rejected")}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminReservations;
