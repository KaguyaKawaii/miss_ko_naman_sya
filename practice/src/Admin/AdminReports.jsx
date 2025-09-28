import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminNavigation from "./AdminNavigation";
import { Eye, RefreshCw, Search, ChevronDown, X } from "lucide-react";

function AdminReports({ setView }) {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

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
  }, []);

  const fetchReports = () => {
    setIsLoading(true);
    axios
      .get("http://localhost:5000/reports")
      .then((res) => {
        const sorted = res.data.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt) : 0;
          const bTime = b.createdAt ? new Date(b.createdAt) : 0;
          return bTime - aTime;
        });
        setReports(sorted);
      })
      .catch((err) => console.error("Fetch reports error:", err))
      .finally(() => setIsLoading(false));
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium";
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

  const filteredReports = reports.filter((report) => {
    const matchesStatus = filter === "All" || report.status === filter;
    const matchesSearch =
      (report.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (report.reportedBy || "").toLowerCase().includes(search.toLowerCase()) ||
      (report.floor || "").toLowerCase().includes(search.toLowerCase()) ||
      (report.room || "").toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <AdminNavigation setView={setView} currentView="adminReports" />
      <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#CC0000]">
                Report Management
              </h1>
              <p className="text-gray-600">
                Manage, assign, and resolve facility reports
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
                  placeholder="Search by category, reported by, location..."
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

          {/* Reports Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">#</th>
                    <th className="px-6 py-3 text-left font-medium">Category</th>
                    <th className="px-6 py-3 text-left font-medium">Reported By</th>
                    <th className="px-6 py-3 text-left font-medium">Location</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-left font-medium">Date Reported</th>
                    <th className="px-6 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        Loading reports...
                      </td>
                    </tr>
                  ) : filteredReports.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No reports found
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((report, i) => (
                      <tr key={report._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{i + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{report.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{report.reportedBy}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{report.floor}</div>
                          <div className="text-gray-500 text-xs">{report.room}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(report.status)}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {report.createdAt ? formatPHDateTime(report.createdAt) : "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-2">
                            {/* View */}
                            <button
                              onClick={() => setSelectedReport(report)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Report Details Modal */}
      {selectedReport && (
        <ReportModal
          report={selectedReport}
          formatPHDateTime={formatPHDateTime}
          onClose={() => setSelectedReport(null)}
          onReportUpdated={fetchReports}
        />
      )}
    </>
  );
}

function ReportModal({
  report,
  formatPHDateTime,
  onClose,
  onReportUpdated,
}) {
  const [actionTaken, setActionTaken] = useState(report.actionTaken || "");
  const [actionLoading, setActionLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(report.assignedTo?._id || "");

  const API_URL = "http://localhost:5000/reports";
  const USERS_API = "http://localhost:5000/api/users";

  // 🔹 Fetch staff list (only staff users)
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await axios.get(`${USERS_API}?role=Staff`);
        setStaffList(res.data.users || []);
      } catch (err) {
        console.error("Failed to fetch staff list", err);
        setStaffList([]);
      }
    };
    fetchStaff();
  }, []);

  // 🔹 Assign staff
  const handleAssignStaff = async () => {
    if (!selectedStaff) {
      alert("Please select a staff to assign.");
      return;
    }

    try {
      setActionLoading(true);
      await axios.put(`${API_URL}/assign/${report._id}`, {
        staffId: selectedStaff,
      });
      alert("Report assigned successfully!");
      onReportUpdated?.();
      onClose();
    } catch (err) {
      console.error("Error assigning staff:", err);
      alert("Failed to assign staff");
    } finally {
      setActionLoading(false);
    }
  };

  // 🔹 Resolve Report
  const handleResolveReport = async () => {
    if (!actionTaken.trim()) {
      alert("Please describe the action taken before resolving.");
      return;
    }

    try {
      setActionLoading(true);
      await axios.put(`${API_URL}/resolve/${report._id}`, {
        actionTaken: actionTaken.trim(),
      });
      alert("Report resolved successfully!");
      onReportUpdated?.();
      onClose();
    } catch (err) {
      console.error("Error resolving report:", err);
      alert("Failed to resolve report");
    } finally {
      setActionLoading(false);
    }
  };

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

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
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

        <div className="p-6 space-y-4">
          {/* Status Badge */}
          <div className="mb-2">
            <span className={getStatusBadge(report.status)}>
              Status: {report.status}
            </span>
          </div>

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
              <h3 className="text-sm font-medium text-gray-500">Assigned To</h3>
              <p className="mt-1 text-gray-800">
                {report.assignedTo ? report.assignedTo.name : "Unassigned"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date Reported</h3>
              <p className="mt-1 text-gray-800">{formatPHDateTime(report.createdAt)}</p>
            </div>
          </div>

          {/* Assign Staff */}
          {report.status !== "Archived" && (
            <div className="pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Staff
              </label>
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                disabled={actionLoading}
              >
                <option value="">-- Select Staff --</option>
                {staffList.map((staff) => (
                  <option key={staff._id} value={staff._id}>
                    {staff.name} {staff.floor ? `(${staff.floor})` : ""}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAssignStaff}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                disabled={actionLoading || !selectedStaff}
              >
                {actionLoading ? "Assigning..." : "Assign Staff"}
              </button>
            </div>
          )}

          {/* Details */}
          <div className="pt-4">
            <h3 className="text-sm font-medium text-gray-500">Details</h3>
            <p className="mt-1 text-gray-800 bg-gray-50 p-4 rounded-lg">{report.details}</p>
          </div>

          {/* Action Taken Section */}
          
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={actionLoading}
          >
            Cancel
          </button>

          {report.status !== "Resolved" && (
            <button
              onClick={handleResolveReport}
              className="px-4 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-[#A30000] font-medium"
              disabled={actionLoading || !actionTaken.trim()}
            >
              {actionLoading ? "Resolving..." : "Resolve Report"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminReports;