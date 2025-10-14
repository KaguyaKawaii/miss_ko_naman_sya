import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminNavigation from "./AdminNavigation";
import { Eye, Trash2, RefreshCw, Search, ChevronDown, X } from "lucide-react";
import AdminReservationModal from "./Modals/AdminReservationModal";

function AdminReservations({ setView }) {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [reservationToArchive, setReservationToArchive] = useState(null);
  const [archiveResult, setArchiveResult] = useState({ show: false, message: "", isSuccess: false });

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

  const handleArchiveClick = (id) => {
    setReservationToArchive(id);
    setShowArchiveConfirm(true);
  };

  const handleArchiveConfirm = () => {
    if (!reservationToArchive) return;
    
    axios
      .post(`http://localhost:5000/reservations/${reservationToArchive}/archive`)
      .then((response) => {
        // Check for both response formats
        if (response.data.success || response.data.message) {
          setArchiveResult({
            show: true,
            message: "Reservation archived successfully.",
            isSuccess: true
          });
          fetchReservations();
        } else {
          setArchiveResult({
            show: true,
            message: "Unexpected response from server.",
            isSuccess: false
          });
        }
      })
      .catch((err) => {
        console.error("Archive error:", err);
        const errorMessage = err.response?.data?.message || err.message || "Failed to archive reservation";
        setArchiveResult({
          show: true,
          message: `Archive failed: ${errorMessage}`,
          isSuccess: false
        });
      })
      .finally(() => {
        setShowArchiveConfirm(false);
        setReservationToArchive(null);
      });
  };

  const handleArchiveCancel = () => {
    setShowArchiveConfirm(false);
    setReservationToArchive(null);
  };

  const handleCloseResultModal = () => {
    setArchiveResult({ show: false, message: "", isSuccess: false });
  };

  const handleView = (reservation) => {
    setSelectedReservation(reservation);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedReservation(null);
    setShowModal(false);
  };

  const handleActionSuccess = () => {
    fetchReservations(); // Refresh the list after successful action
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
                  <option value="Ongoing">Ongoing</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Expired">Expired</option>
                  <option value="Completed">Completed</option>
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
                      const endDate = new Date(r.endDatetime);

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
                                  : r.status === "Ongoing"
                                  ? "bg-blue-100 text-blue-800"
                                  : r.status === "Rejected"
                                  ? "bg-red-100 text-red-800"
                                  : r.status === "Cancelled"
                                  ? "bg-gray-100 text-gray-800"
                                  : r.status === "Expired"
                                  ? "bg-orange-100 text-orange-800"
                                  : r.status === "Completed"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {r.status}
                              {r.extensionRequested && (
                                <span className="ml-1 text-xs">
                                  (Ext)
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {createdAt ? formatPHDateTime(createdAt) : "—"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end space-x-2">
                              {/* View */}
                              <button
                                onClick={() => handleView(r)}
                                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                title="View Details"
                              >
                                <Eye size={18} />
                              </button>
                              {/* Archive */}
                              <button
                                onClick={() => handleArchiveClick(r._id)}
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

      {/* Reservation Modal */}
      {showModal && selectedReservation && (
        <AdminReservationModal
          reservation={selectedReservation}
          onClose={handleCloseModal}
          onActionSuccess={handleActionSuccess}
          currentUser={{ role: "Admin" }}
        />
      )}

      {/* Archive Confirmation Modal */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <Trash2 className="text-red-600" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Archive Reservation
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to archive this reservation? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleArchiveCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleArchiveConfirm}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Result Modal */}
      {archiveResult.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                archiveResult.isSuccess ? "bg-green-100" : "bg-red-100"
              }`}>
                {archiveResult.isSuccess ? (
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {archiveResult.isSuccess ? "Success" : "Error"}
              </h3>
            </div>
            <p className="text-gray-600 mb-6">{archiveResult.message}</p>
            <div className="flex justify-end">
              <button
                onClick={handleCloseResultModal}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  archiveResult.isSuccess 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminReservations;