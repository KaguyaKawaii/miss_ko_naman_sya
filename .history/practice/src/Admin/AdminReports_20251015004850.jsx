import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminNavigation from "./AdminNavigation";
import { Eye, RefreshCw, Search, ChevronDown, X } from "lucide-react";
import {
  Clock,
  MapPin,
  Calendar,
  FileText,
  User,
  Building,
  AlertCircle,
  CheckCircle,
  XCircle,
  Users,
  Wrench,
  AlertTriangle
} from "lucide-react";

function AdminReports({ setView }) {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All"); // New date filter
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [categories, setCategories] = useState([]);

  // Improved date formatting function
  const formatPHDateTime = (date) => {
    if (!date) return "—";
    
    try {
      // Ensure we're working with a Date object
      const dateObj = new Date(date);
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn("Invalid date:", date);
        return "—";
      }
      
      return dateObj.toLocaleString("en-PH", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting date:", date, error);
      return "—";
    }
  };

  // Format date for table (date only)
  const formatDateOnly = (date) => {
    if (!date) return "—";
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return "—";
      
      return dateObj.toLocaleDateString("en-PH", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "—";
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = () => {
    setIsLoading(true);
    axios
      .get("http://localhost:5000/reports")
      .then((res) => {
        console.log("Raw reports data:", res.data);
        
        // Sort by createdAt in descending order (latest first) with proper date handling
        const sorted = res.data
          .map(report => ({
            ...report,
            // Ensure createdAt is a proper Date object
            createdAt: report.createdAt ? new Date(report.createdAt) : new Date(0)
          }))
          .sort((a, b) => {
            return b.createdAt - a.createdAt; // Descending order
          });
        
        console.log("Sorted reports:", sorted);
        setReports(sorted);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(sorted.map(report => report.category).filter(Boolean))];
        setCategories(uniqueCategories.sort());
      })
      .catch((err) => {
        console.error("Fetch reports error:", err);
        setReports([]);
        setCategories([]);
      })
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
    const matchesStatus = statusFilter === "All" || report.status === statusFilter;
    const matchesCategory = categoryFilter === "All" || report.category === categoryFilter;
    const matchesSearch =
      (report.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (report.reportedBy || "").toLowerCase().includes(search.toLowerCase()) ||
      (report.floor || "").toLowerCase().includes(search.toLowerCase()) ||
      (report.room || "").toLowerCase().includes(search.toLowerCase());
    
    // New date filter logic
    const matchesDate = (() => {
      if (dateFilter === "All") return true;
      
      const reportDate = new Date(report.createdAt);
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      switch (dateFilter) {
        case "Newer":
          return reportDate >= oneWeekAgo;
        case "Older":
          return reportDate < oneMonthAgo;
        case "Recent":
          return reportDate >= oneMonthAgo;
        default:
          return true;
      }
    })();
    
    return matchesStatus && matchesCategory && matchesSearch && matchesDate;
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
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Archived">Archived</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={16}
                />
              </div>

              {/* Category filter */}
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={16}
                />
              </div>

              {/* Date filter - NEW */}
              <div className="relative">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="appearance-none pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All Dates</option>
                  <option value="Newer">Newer (Last 7 days)</option>
                  <option value="Recent">Recent (Last 30 days)</option>
                  <option value="Older">Older (30+ days)</option>
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
                          {formatDateOnly(report.createdAt)}
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
          onClose={() => setSelectedReport(null)}
          onReportUpdated={fetchReports}
        />
      )}
    </>
  );
}

// Updated ReportModal Component with improved date handling
function ReportModal({
  report,
  onClose,
  onReportUpdated,
}) {
  const [actionTaken, setActionTaken] = useState(report.actionTaken || "");
  const [actionLoading, setActionLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(report.assignedTo?._id || "");
  const [assigning, setAssigning] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");

  const API_URL = "http://localhost:5000/reports";
  const USERS_API = "http://localhost:5000/api/users";

  // Improved date formatting function
  const formatPHDateTime = (iso) => {
    if (!iso) return "N/A";
    
    try {
      const date = new Date(iso);
      if (isNaN(date.getTime())) return "N/A";
      
      return date.toLocaleString("en-PH", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  // 🔹 Fetch staff list - Improved to handle different API responses
  useEffect(() => {
    const fetchStaff = async () => {
      if (!report) return;

      try {
        console.log("Fetching staff for report on floor:", report.floor);
        
        // Try multiple possible endpoints
        const endpoints = [
          "http://localhost:5000/api/users?role=Staff",
          "http://localhost:5000/users?role=Staff",
          "http://localhost:5000/api/staff",
          "http://localhost:5000/staff"
        ];
        
        let staffData = [];
        
        for (const endpoint of endpoints) {
          try {
            console.log(`Trying endpoint: ${endpoint}`);
            const res = await axios.get(endpoint);
            console.log("API Response:", res.data);
            
            // Handle different response structures
            if (res.data.success && Array.isArray(res.data.users)) {
              staffData = res.data.users.filter(user => user.role === "Staff");
              break;
            } else if (Array.isArray(res.data)) {
              staffData = res.data.filter(user => user.role === "Staff");
              break;
            } else if (res.data && Array.isArray(res.data.users)) {
              staffData = res.data.users.filter(user => user.role === "Staff");
              break;
            } else if (res.data && Array.isArray(res.data.data)) {
              staffData = res.data.data.filter(user => user.role === "Staff");
              break;
            } else if (res.data.success && Array.isArray(res.data.staff)) {
              staffData = res.data.staff;
              break;
            }
          } catch (err) {
            console.log(`Endpoint ${endpoint} failed:`, err.message);
            continue;
          }
        }
        
        // If all endpoints failed, try the main users endpoint without filter
        if (staffData.length === 0) {
          try {
            console.log("Trying main users endpoint without filter...");
            const res = await axios.get("http://localhost:5000/users");
            if (Array.isArray(res.data)) {
              staffData = res.data.filter(user => user.role === "Staff");
            } else if (res.data.success && Array.isArray(res.data.users)) {
              staffData = res.data.users.filter(user => user.role === "Staff");
            }
          } catch (finalErr) {
            console.error("All endpoints failed:", finalErr);
          }
        }

        // If still no staff data, use mock data for testing
        if (staffData.length === 0) {
          console.log("Using mock staff data for testing");
          staffData = [
            { _id: "1", name: "John Doe", role: "Staff", floor: "Ground Floor" },
            { _id: "2", name: "Jane Smith", role: "Staff", floor: "Second Floor" },
            { _id: "3", name: "Mike Johnson", role: "Staff", floor: "Third Floor" },
            { _id: "4", name: "Sarah Wilson", role: "Staff", floor: "Fourth Floor" },
            { _id: "5", name: "David Brown", role: "Staff", floor: "Fifth Floor" }
          ];
        }

        console.log("Final staff data:", staffData);
        
        // Sort staff by name for better organization
        const sortedStaff = staffData.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setStaffList(sortedStaff);
        
      } catch (err) {
        console.error("Failed to fetch staff", err);
        setStaffList([]);
      }
    };

    fetchStaff();
  }, [report]);

  // 🔹 Assign staff
  const handleAssignStaff = async () => {
    if (!selectedStaff || !report) {
      alert("Please select a staff member to assign.");
      return;
    }

    try {
      setAssigning(true);
      await axios.put(`${API_URL}/assign/${report._id}`, {
        staffId: selectedStaff,
      });
      
      // Refresh report data
      if (onReportUpdated) onReportUpdated();
      
      alert("Report assigned successfully!");
    } catch (err) {
      console.error("Error assigning staff:", err);
      alert("Failed to assign staff: " + (err.response?.data?.message || err.message));
    } finally {
      setAssigning(false);
    }
  };

  // 🔹 Resolve Report
// 🔹 Resolve Report
const handleResolveReport = async () => {
  if (!report || !actionTaken.trim()) {
    alert("Please describe the action taken before resolving.");
    return;
  }

  try {
    setActionLoading(true);
    
    // Get the current user ID from localStorage or your auth context
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const resolvedBy = currentUser._id || "admin"; // Fallback if no user ID
    
    await axios.put(`${API_URL}/resolve/${report._id}`, {
      actionTaken: actionTaken.trim(),
      resolvedBy: resolvedBy
    });
    
    if (onReportUpdated) onReportUpdated();
    alert("Report resolved successfully!");
    setShowConfirmModal(false);
  } catch (err) {
    console.error("Error resolving report:", err);
    alert("Failed to resolve report: " + (err.response?.data?.message || err.message));
  } finally {
    setActionLoading(false);
  }
};

  // 🔹 Archive Report
// 🔹 Archive Report
const handleArchiveReport = async () => {
  if (!report) return;

  try {
    setActionLoading(true);
    
    // Get the current user ID from localStorage or your auth context
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const archivedBy = currentUser._id || "admin"; // Fallback if no user ID
    
    await axios.put(`${API_URL}/archive/${report._id}`, {
      archivedBy: archivedBy
    });
    
    alert("Report archived successfully!");
    if (onReportUpdated) onReportUpdated();
    onClose();
    setShowConfirmModal(false);
  } catch (err) {
    console.error("Error archiving report:", err);
    alert("Failed to archive report: " + (err.response?.data?.message || err.message));
  } finally {
    setActionLoading(false);
  }
};
  const getStatusConfig = (status) => {
    const configs = {
      Pending: { 
        color: "bg-amber-100 text-amber-800 border-amber-200", 
        icon: <Clock size={14} />,
      },
      "In Progress": { 
        color: "bg-blue-100 text-blue-800 border-blue-200", 
        icon: <CheckCircle size={14} />,
      },
      Resolved: { 
        color: "bg-emerald-100 text-emerald-800 border-emerald-200", 
        icon: <CheckCircle size={14} />,
      },
      Archived: { 
        color: "bg-gray-100 text-gray-800 border-gray-300", 
        icon: <XCircle size={14} />,
      }
    };
    return configs[status] || configs.Pending;
  };

  const showConfirmation = (action) => {
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    switch (confirmAction) {
      case "resolve":
        handleResolveReport();
        break;
      case "archive":
        handleArchiveReport();
        break;
      default:
        setShowConfirmModal(false);
    }
  };

  const getConfirmModalConfig = () => {
    switch (confirmAction) {
      case "resolve":
        return {
          title: "Resolve Report",
          message: "Are you sure you want to resolve this report? This action cannot be undone.",
          icon: <CheckCircle className="text-emerald-600" size={24} />,
          confirmText: "Yes, Resolve Report",
          confirmColor: "bg-emerald-600 hover:bg-emerald-700"
        };
      case "archive":
        return {
          title: "Archive Report",
          message: "Are you sure you want to archive this report? This will remove it from active reports.",
          icon: <XCircle className="text-gray-600" size={24} />,
          confirmText: "Yes, Archive Report",
          confirmColor: "bg-gray-600 hover:bg-gray-700"
        };
      default:
        return {
          title: "Confirm Action",
          message: "Are you sure you want to proceed?",
          icon: <AlertCircle className="text-blue-600" size={24} />,
          confirmText: "Confirm",
          confirmColor: "bg-blue-600 hover:bg-blue-700"
        };
    }
  };

  const InfoCard = ({ title, value, icon, subtitle }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{title}</p>
          <p className="text-lg font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );

  const renderActionButtons = () => {
    if (!report) return null;

    switch (report.status) {
      case "Pending":
      case "In Progress":
        return (
          <div className="flex gap-2">
            <button
              onClick={() => showConfirmation("archive")}
              disabled={actionLoading || assigning}
              className="px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm flex items-center gap-2"
            >
              <XCircle size={16} />
              Archive
            </button>
            <button
              onClick={() => showConfirmation("resolve")}
              disabled={actionLoading || assigning || !actionTaken.trim()}
              className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm flex items-center gap-2"
            >
              <CheckCircle size={16} />
              Resolve Report
            </button>
          </div>
        );

      default:
        return (
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium text-sm"
          >
            Close
          </button>
        );
    }
  };

  const statusConfig = getStatusConfig(report?.status);
  const confirmConfig = getConfirmModalConfig();

  return (
    <>
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-white p-6 border-b border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center border border-red-300">
                  <AlertTriangle size={24} className="text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">Report Details</h1>
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Building size={16} />
                      {report?.floor} • {report?.room}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Calendar size={16} />
                      {report?.createdAt ? formatPHDateTime(report.createdAt) : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 text-sm font-medium ${statusConfig?.color}`}>
                  {statusConfig?.icon}
                  {report?.status}
                </div>
                <button
                  onClick={onClose}
                  disabled={actionLoading || assigning}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {["overview", "actions"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex-1 ${
                    activeTab === tab
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {report ? (
              <>
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InfoCard
                        title="Category"
                        value={report.category || "N/A"}
                        icon={<FileText size={20} />}
                        subtitle="Issue type"
                      />
                      <InfoCard
                        title="Reported By"
                        value={report.reportedBy || "N/A"}
                        icon={<User size={20} />}
                        subtitle="Reporter"
                      />
                      <InfoCard
                        title="Assigned To"
                        value={report.assignedTo?.name || "Unassigned"}
                        icon={<Wrench size={20} />}
                        subtitle="Staff member"
                      />
                    </div>

                    {/* Location & Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Location Card */}
                      <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <MapPin size={20} className="text-gray-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Location Details</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between py-2">
                            <span className="text-gray-600">Floor</span>
                            <span className="font-semibold text-gray-900">{report.floor || "N/A"}</span>
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <span className="text-gray-600">Room</span>
                            <span className="font-semibold text-gray-900">{report.room || "N/A"}</span>
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <span className="text-gray-600">Date Reported</span>
                            <span className="font-semibold text-gray-900">{formatPHDateTime(report.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Issue Details Card */}
                      <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <AlertTriangle size={20} className="text-gray-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Issue Details</h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                          {report.details || "No details provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "actions" && (
                  <div className="space-y-6">
                    {/* Assign Staff Section */}
                    {report.status !== "Resolved" && report.status !== "Archived" && (
                      <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Users size={20} className="text-blue-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Assign to Staff</h3>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Select Staff Member
                            </label>
                            <select
                              value={selectedStaff}
                              onChange={(e) => setSelectedStaff(e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={assigning}
                            >
                              <option value="">-- Select Staff Member --</option>
                              {staffList.map((staff) => (
                                <option key={staff._id} value={staff._id}>
                                  {staff.name} {staff.floor ? `(Floor ${staff.floor})` : ""}
                                </option>
                              ))}
                            </select>
                            {staffList.length === 0 && (
                              <p className="text-sm text-amber-600 mt-2">
                                No staff members available.
                              </p>
                            )}
                          </div>
                          
                          <button
                            onClick={handleAssignStaff}
                            disabled={assigning || !selectedStaff}
                            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm flex items-center gap-2"
                          >
                            <CheckCircle size={16} />
                            {assigning ? "Assigning..." : "Assign Staff"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action Taken Section */}
                    {report.status !== "Resolved" && report.status !== "Archived" && (
                      <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-emerald-100 rounded-lg">
                            <Wrench size={20} className="text-emerald-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Action Taken</h3>
                        </div>

                        <div className="space-y-4">
                          <textarea
                            value={actionTaken}
                            onChange={(e) => setActionTaken(e.target.value)}
                            placeholder="Describe what action was taken to resolve this report..."
                            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                            disabled={actionLoading}
                          />
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-blue-700">
                                Please provide detailed information about the actions taken to resolve this report. This will be recorded for future reference.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Show existing action taken for resolved reports */}
                    {report.status === "Resolved" && report.actionTaken && (
                      <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-emerald-100 rounded-lg">
                            <CheckCircle size={20} className="text-emerald-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Action Taken</h3>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                          <p className="text-emerald-800 leading-relaxed">
                            {report.actionTaken}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Report not found.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Report ID:</span>{" "}
                <span className="font-mono text-gray-800">{report?._id?.slice(-8)}</span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
                {renderActionButtons()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
            <div className="bg-white p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {confirmConfig.icon}
                <h3 className="text-xl font-bold text-gray-900">{confirmConfig.title}</h3>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-6">{confirmConfig.message}</p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 hover:bg-gray-100 rounded-lg"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  disabled={actionLoading}
                  className={`px-6 py-2.5 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${confirmConfig.confirmColor}`}
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    confirmConfig.confirmText
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminReports