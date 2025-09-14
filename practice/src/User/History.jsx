import { useEffect, useState } from "react";
import axios from "axios";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";

function History({ user, setView, setSelectedReservation, historyRefreshKey }) {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [dateFilter, setDateFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!user || !user._id) return;

    const fetchReservations = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/reservations/user/${user._id}`);
        const sortedReservations = res.data.sort(
          (a, b) => new Date(b.datetime) - new Date(a.datetime)
        );
        setReservations(sortedReservations);
        setFilteredReservations(sortedReservations);
      } catch (error) {
        console.error("Failed to fetch reservations:", error);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchReservations();
  }, [user, historyRefreshKey]);

  useEffect(() => {
    let results = [...reservations];
    
    if (dateFilter) {
      const filterDate = new Date(dateFilter).setHours(0, 0, 0, 0);
      results = results.filter(res => {
        const resDate = new Date(res.datetime).setHours(0, 0, 0, 0);
        return resDate === filterDate;
      });
    }
    
    if (statusFilter !== "all") {
      results = results.filter(res => res.status === statusFilter);
    }
    
    setFilteredReservations(results);
  }, [dateFilter, statusFilter, reservations]);

  const formatPH = (d) =>
    new Date(d).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const statusBadge = (status) => {
    const color =
      status === "Approved"
        ? "bg-green-100 text-green-700"
        : status === "Pending"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700";
    return (
      <span
        className={`px-3 py-0.5 rounded-full text-xs font-semibold ${color}`}
      >
        {status}
      </span>
    );
  };

  const clearFilters = () => {
    setDateFilter(null);
    setStatusFilter("all");
  };

  const SkeletonLoader = () => (
    <div className="animate-pulse space-y-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex gap-4 items-start border-b border-gray-100 pb-6"
        >
          <div className="mt-1.5">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>

          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-300 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/5"></div>
            <div className="h-4 bg-gray-200 rounded w-3/5"></div>
            <div className="flex gap-2 mt-2">
              <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
              <div className="h-4 w-28 bg-gray-200 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 rounded ml-auto"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">
      {/* Header - unchanged */}
      <header className=" text-black px-6 h-[60px] flex items-center justify-between shadow-sm">
        <h1 className="text-xl md:text-2xl font-bold tracking-wide">Reservation History</h1>
      </header>
      
      <div className="m-5 border border-gray-200 rounded-lg p-6 bg-white shadow-md overflow-y-auto">
        {/* Stats and Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="bg-gray-50 px-4 py-2 rounded-lg">
            <p className="text-sm text-gray-600">
              Total Reservations: <span className="font-bold text-gray-800">{reservations.length}</span>
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
  onClick={() => setShowFilterModal(true)}
  className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition text-sm cursor-pointer"
>
  {/* Filter SVG */}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4 text-gray-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 13.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 019 17v-3.586L3.293 6.707A1 1 0 013 6V4z"
    />
  </svg>
  Filters
</button>

            
            {(dateFilter || statusFilter !== "all") && (
              <button 
                onClick={clearFilters}
                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {(dateFilter || statusFilter !== "all") && (
          <div className="flex flex-wrap gap-2 mb-6">
            {dateFilter && (
              <div className="bg-gray-100 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                <span className="text-gray-700">Date: {new Date(dateFilter).toLocaleDateString()}</span>
                <button 
                  onClick={() => setDateFilter(null)}
                  className="text-gray-500 hover:text-gray-700 ml-1"
                >
                  ×
                </button>
              </div>
            )}
            {statusFilter !== "all" && (
              <div className="bg-gray-100 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                <span className="text-gray-700">Status: {statusFilter}</span>
                <button 
                  onClick={() => setStatusFilter("all")}
                  className="text-gray-500 hover:text-gray-700 ml-1"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}

        {/* Reservation List */}
        {loading ? (
          <SkeletonLoader />
        ) : filteredReservations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl text-gray-400 mb-3">📋</div>
            <p className="text-gray-600">
              {reservations.length === 0 
                ? "No reservation records found." 
                : "No reservations match your filters."}
            </p>
            {(dateFilter || statusFilter !== "all") && (
              <button 
                onClick={clearFilters}
                className="text-[#CC0000] font-medium mt-2 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReservations.map((res, index) => (
              <div
                key={res._id || index}
                className="flex gap-4 items-start border-b border-gray-100 pb-6 hover:bg-gray-50 transition-colors duration-200 p-3 rounded-lg"
              >
                <div className="mt-1.5">
                  <div className="w-3 h-3 bg-[#CC0000] rounded-full"></div>
                </div>

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-1">
                    <h2 className="text-lg font-bold text-gray-800">
                      {res.roomName}
                    </h2>
                    {statusBadge(res.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Location:</span> {res.location}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Schedule:</span> {formatPH(res.datetime)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Purpose:</span> {res.purpose}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Reserved on:</span>{" "}
                      {new Date(res.createdAt).toLocaleDateString("en-PH", {
                        timeZone: "Asia/Manila",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedReservation(res);
                      setView("reservationDetails");
                    }}
                    className="text-[#CC0000] text-sm font-medium hover:underline mt-2 cursor-pointer flex items-center gap-1"
                  >
                    View Details
                    <i className="fas fa-chevron-right text-xs"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Filter Reservations</h3>
                <button 
                  onClick={() => setShowFilterModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
                  <Calendar
                    onChange={setDateFilter}
                    value={dateFilter}
                    className="border-0 w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setStatusFilter("all")}
                      className={`px-3 py-2 rounded-lg text-sm cursor-pointer ${statusFilter === "all" ? "bg-[#CC0000] text-white" : "bg-gray-100 text-gray-700"}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setStatusFilter("Approved")}
                      className={`px-3 py-2 rounded-lg text-sm cursor-pointer ${statusFilter === "Approved" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                    >
                      Approved
                    </button>
                    <button
                      onClick={() => setStatusFilter("Pending")}
                      className={`px-3 py-2 rounded-lg text-sm cursor-pointer ${statusFilter === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => setStatusFilter("Rejected")}
                      className={`px-3 py-2 rounded-lg text-sm cursor-pointer ${statusFilter === "Rejected" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}
                    >
                      Rejected
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="px-4 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-red-700 transition cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default History;