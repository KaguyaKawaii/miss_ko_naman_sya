import React, { useState, useEffect } from "react";
import axios from "axios";
import StaffNavigation from "./StaffNavigation";
import { Eye, RefreshCw, Search, ChevronDown, X, CheckCircle, Clock } from "lucide-react";

function StaffReports({ setView, staff }) {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  useEffect(() => {
    fetchReports();
  }, [staff?._id]);

  const fetchReports = () => {
    if (!staff?._id) return;
    
    setIsLoading(true);
    axios
      .get(`http://localhost:5000/reports/staff/${staff._id}`)
      .then((res) => {
        const sorted = res.data.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt) : 0;
          const bTime = b.createdAt ? new Date(b.createdAt) : 0;
          return bTime - aTime;
        });
        setReports(sorted);
      })
      .catch((err) => {
        console.error("Fetch reports error:", err);
        setErrorMessage("Failed to fetch reports");
        setShowErrorModal(true);
      })
      .finally(() => setIsLoading(false));
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "Pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "Resolved":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Archived":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case "In Progress":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const updateReportStatus = async (reportId, newStatus) => {
    try {
      // FIXED: Use the correct endpoint format
      if (newStatus === "In Progress") {
        // Use the start endpoint for "In Progress"
        await axios.post(`http://localhost:5000/reports/${reportId}/start`, { 
          startedBy: staff?._id 
        });
      } else if (newStatus === "Resolved") {
        // Use the resolve endpoint for "Resolved"
        await axios.put(`http://localhost:5000/reports/${reportId}/resolve`, { 
          actionTaken: "Resolved by staff", // You might want to make this dynamic
          resolvedBy: staff?._id 
        });
      } else {
        // Use status endpoint for other status changes
        await axios.put(`http://localhost:5000/reports/${reportId}/status`, { 
          status: newStatus,
          updatedBy: staff?._id 
        });
      }
      
      setSuccessMessage(`Report successfully marked as ${newStatus}`);
      setShowSuccessModal(true);
      fetchReports();
      setSelectedReport(null);
    } catch (err) {
      console.error("Failed to update report status:", err);
      setErrorMessage("Failed to update report status: " + (err.response?.data?.message || err.message));
      setShowErrorModal(true);
    }
  };

  // Filter out resolved reports that are older than 24 hours
  const shouldShowReport = (report) => {
    if (report.status === "Resolved") {
      const resolvedTime = report.updatedAt || report.createdAt;
      const now = new Date();
      const reportTime = new Date(resolvedTime);
      const hoursDiff = (now - reportTime) / (1000 * 60 * 60);
      
      // Hide resolved reports older than 24 hours
      return hoursDiff <= 24;
    }
    return true;
  };

  const filteredReports = reports.filter((report) => {
    const matchesStatus = filter === "All" || report.status === filter;
    const matchesSearch =
      (report.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (report.reportedBy || "").toLowerCase().includes(search.toLowerCase()) ||
      (report.floor || "").toLowerCase().includes(search.toLowerCase()) ||
      (report.room || "").toLowerCase().includes(search.toLowerCase()) ||
      (report.details || "").toLowerCase().includes(search.toLowerCase());
    const shouldShow = shouldShowReport(report);
    
    return matchesStatus && matchesSearch && shouldShow;
  });

  return (
    <>
      <StaffNavigation setView={setView} currentView="staffReports" staff={staff} />
      <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#CC0000]">
                Assigned Reports
              </h1>
              <p className="text-gray-600">
                Manage and resolve reports assigned to you
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
                  placeholder="Search reports by category, location, or details..."
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
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={16}
                />
              </div>

              {/* Refresh */}
              <button
                onClick={fetchReports}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={16} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500 text-lg">Loading reports...</div>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500 text-lg">No reports found</div>
                <p className="text-gray-400 mt-2">
                  {reports.length === 0 ? "No reports have been assigned to you yet." : "No reports match your search criteria."}
                </p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {report.category}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Reported by {report.reportedBy}
                        </p>
                      </div>
                      <span className={getStatusBadge(report.status)}>
                        {report.status}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Location:</span> {report.floor} - {report.room}
                      </p>
                    </div>

                    {/* Details Preview */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {report.details}
                      </p>
                    </div>

                    {/* Priority and Date */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {formatPHDateTime(report.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Report Details Modal */}
      {selectedReport && (
        <ReportModal
          report={selectedReport}
          formatPHDateTime={formatPHDateTime}
          onClose={() => setSelectedReport(null)}
          onStatusUpdate={updateReportStatus}
          staff={staff}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600 mb-6">{successMessage}</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600 mb-6">{errorMessage}</p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ReportModal({
  report,
  formatPHDateTime,
  onClose,
  onStatusUpdate,
  staff
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [actionTaken, setActionTaken] = useState("");

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case "Pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "Resolved":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Archived":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case "In Progress":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handleStatusUpdate = (reportId, newStatus) => {
    if (newStatus === "Resolved") {
      setPendingStatus(newStatus);
      setShowConfirmModal(true);
    } else {
      onStatusUpdate(reportId, newStatus);
    }
  };

  const confirmStatusUpdate = () => {
    // For resolved reports, we need to pass actionTaken
    if (pendingStatus === "Resolved") {
      onStatusUpdate(report._id, pendingStatus);
    } else {
      onStatusUpdate(report._id, pendingStatus);
    }
    setShowConfirmModal(false);
    setPendingStatus(null);
    setActionTaken("");
  };

  const cancelStatusUpdate = () => {
    setShowConfirmModal(false);
    setPendingStatus(null);
    setActionTaken("");
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
          <header className="flex justify-between items-center bg-white px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Report Details
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </header>

          <div className="p-6 space-y-6">
            {/* Status and Priority */}
            <div className="flex gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Status</span>
                <div className="mt-1">
                  <span className={getStatusBadge(report.status)}>
                    {report.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Report Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Category</h3>
                <p className="mt-1 text-gray-800">{report.category}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Reported By</h3>
                <p className="mt-1 text-gray-800">{report.reportedBy}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Floor</h3>
                <p className="mt-1 text-gray-800">{report.floor}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Room</h3>
                <p className="mt-1 text-gray-800">{report.room}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date Reported</h3>
                <p className="mt-1 text-gray-800">{formatPHDateTime(report.createdAt)}</p>
              </div>
            </div>

            {/* Details */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800 whitespace-pre-wrap">{report.details}</p>
              </div>
            </div>

            {/* Action Taken (if resolved) */}
            {report.status === "Resolved" && report.actionTaken && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Action Taken</h3>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-gray-800 whitespace-pre-wrap">{report.actionTaken}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>

            {report.status === "Pending" && (
              <button
                onClick={() => handleStatusUpdate(report._id, "In Progress")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Work
              </button>
            )}

            {report.status === "In Progress" && (
              <button
                onClick={() => handleStatusUpdate(report._id, "Resolved")}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Mark Resolved
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Confirm Action</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to mark this report as resolved? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelStatusUpdate}
                  className="flex-1 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusUpdate}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default StaffReports;