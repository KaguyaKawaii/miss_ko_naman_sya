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
    const colorClass = {
      Approved: "bg-green-100 text-green-800 border border-green-200",
      Pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      Rejected: "bg-red-100 text-red-800 border border-red-200",
      Cancelled: "bg-gray-100 text-gray-600 border border-gray-200",
      Expired: "bg-gray-200 text-gray-500 border border-gray-300",
    }[status] || "bg-gray-100 text-gray-600 border border-gray-200";
    
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}
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
    <div className="animate-pulse space-y-6">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex gap-4 items-start p-4 border border-gray-200 rounded-lg bg-white"
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
              <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
              <div className="h-4 w-28 bg-gray-200 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 rounded ml-auto"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="text-black px-6 h-[60px] flex items-center justify-between shadow-sm bg-white">
        <h1 className="text-xl md:text-2xl font-bold tracking-wide">Reservation History</h1>
        
      </header>
      
      <div className="p-6 space-y-6">
        {/* Stats and Filter Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Reservation Overview</h2>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                Total Reservations: <span className="font-bold text-gray-800">{reservations.length}</span>
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilterModal(true)}
                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm cursor-pointer"
              >
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
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 13.414V19a1 1 0 01-1.447.894极狐l-4-2A1 1 0 019 17v-3.586L3.293 6.707A1 1 0 013 6V4z"
                  />
                </svg>
                Filters
              </button>
              
              {(dateFilter || statusFilter !== "all") && (
                <button 
                  onClick={clearFilters}
                  className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {(dateFilter || statusFilter !== "all") && (
            <div className="flex flex-wrap gap-2 mt-4">
              {dateFilter && (
                <div className="bg-gray-100 px-3 py-1.5 rounded-full text-sm flex items-center gap-1 border border-gray-200">
                  <span className="text-gray-700">Date: {new Date(dateFilter).toLocaleDateString()}</span>
                  <button 
                    onClick={() => setDateFilter(null)}
                    className="text-gray-500 hover:text-gray-700  cursor-pointer font-bold"
                  >
                    ×
                  </button>
                </div>
              )}
              {statusFilter !== "all" && (
                <div className="bg-gray-100 px-3 py-1.5 rounded-full text-sm flex items-center gap-1 border border-gray-200">
                  <span className="text-gray-700">Status: {statusFilter}</span>
                  <button 
                    onClick={() => setStatusFilter("all")}
                    className="text-gray-500 hover:text-gray-700 cursor-pointer text-lg font-semibold"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reservation List Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            {filteredReservations.length} Reservation{filteredReservations.length !== 1 ? 's' : ''} Found
          </h2>
          
          {loading ? (
            <SkeletonLoader />
          ) : filteredReservations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl text-gray-400 mb-3 flex justify-center">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-10 h-10"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
</div>
              <p className="text-gray-600 mb-2">
                {reservations.length === 0 
                  ? "No reservation records found." 
                  : "No reservations match your filters."}
              </p>
              {(dateFilter || statusFilter !== "all") && (
                <button 
                  onClick={clearFilters}
                  className="text-[#CC0000] font-medium hover:underline flex items-center justify-center mx-auto cursor-pointer"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReservations.map((res, index) => (
                <div
                  key={res._id || index}
                  className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  onClick={() => {
                    setSelectedReservation(res);
                    setView("reservationDetails");
                  }}
                >
                  <div className="mt-1.5">
                    <div className="w-3 h-3 bg-[#CC0000] rounded-full"></div>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                      <h2 className="text-lg font-bold text-gray-800">
                        {res.roomName}
                      </h2>
                      {statusBadge(res.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-极狐6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm text-gray-600">
                          <span className="font-semibold">Location:</span> {res.location}
                        </span>
                      </div>
                      
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-600">
                          <span className="font-semibold">Schedule:</span> {formatPH(res.datetime)}
                        </span>
                      </div>
                      
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-600">
                          <span className="font-semibold">Purpose:</span> {res.purpose}
                        </span>
                      </div>
                      
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke极狐="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2极狐H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-600">
                          <span className="font-semibold">Reserved on:</span>{" "}
                          {new Date(res.createdAt).toLocaleDateString("en-PH", {
                            timeZone: "Asia/Manila",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-end text-[#CC0000] text-sm font-medium mt-2">
                      <span>View Details</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-gray-800/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 13.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 019 17v-3.586L3.293 6.707A1 1 0 013 6V4z" />
                  </svg>
                  Filter Reservations
                </h3>
                <button 
                  onClick={() => setShowFilterModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className=" text-sm font-medium text-gray-700 mb-3 flex items-center">
                    
                    Filter by Date
                  </label>
                  <Calendar
                    onChange={setDateFilter}
                    value={dateFilter}
                    className="border border-gray-300 rounded-lg p-2 w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 flex items-center">

                    Filter by Status
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setStatusFilter("all")}
                      className={`px-4 py-2.5 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-center ${
                        statusFilter === "all" 
                          ? "bg-[#CC0000] text-white border border-[#CC0000]" 
                          : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                      }`}
                    >
                      All Status
                    </button>
                    <button
                      onClick={() => setStatusFilter("Approved")}
                      className={`px-4 py-2.5 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-center ${
                        statusFilter === "Approved" 
                          ? "bg-green-100 text-green-800 border border-green-300" 
                          : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                      }`}
                    >
                      Approved
                    </button>
                    <button
                      onClick={() => setStatusFilter("Pending")}
                      className={`px-4 py-2.5 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-center ${
                        statusFilter === "Pending" 
                          ? "bg-yellow-100 text-yellow-800 border border-yellow-300" 
                          : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => setStatusFilter("Rejected")}
                      className={`px-4 py-2.5 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-center ${
                        statusFilter === "Rejected" 
                          ? "bg-red-100 text-red-800 border border-red-300" 
                          : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                      }`}
                    >
                      Rejected
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
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