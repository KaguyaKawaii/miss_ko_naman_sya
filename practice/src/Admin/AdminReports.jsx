import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminNavigation from "./AdminNavigation";
import {
  FileText,
  Download,
  Search,
  X,
  Trash2,
  ChevronDown,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";


function AdminReports({ setView }) {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const reportRef = React.useRef();

  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const openModal = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedReport(null);
    setShowModal(false);
  };

  const openDeleteModal = (report) => {
    setReportToDelete(report);
    setDeleteConfirmModal(true);
  };

  const closeDeleteModal = () => {
    setReportToDelete(null);
    setDeleteConfirmModal(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = () => {
    setIsLoading(true);
    axios
      .get("http://localhost:5000/reports")
      .then((res) => setReports(res.data))
      .catch((err) => console.error("Error fetching reports:", err))
      .finally(() => setIsLoading(false));
  };

  // ✅ FIXED handleDeleteReport with proper error handling
  const handleDeleteReport = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5000/reports/archive/${id}`);

      if (res.data?.success) {
        // ✅ Safely remove the report from the table
        setReports((prev) => prev.filter((r) => r._id !== id));
        setSuccessMessage("✅ Report archived successfully.");
      } else {
        console.warn("⚠️ Archive API response unexpected:", res.data);
        setSuccessMessage("❌ Archive failed. Please check backend logs.");
      }
    } catch (err) {
      console.error("❌ Archive failed:", err);
      setSuccessMessage("❌ Failed to archive report. Check console for details.");
    } finally {
      closeDeleteModal();
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filter === "All" || report.category === filter;

    return matchesSearch && matchesFilter;
  });

  const categories = ["All", ...new Set(reports.map((r) => r.category))];

  const getStatusBadge = (category) => {
    const baseClasses = "inline-flex px-3 py-1 rounded-full text-xs font-medium";
    
    switch(category) {
      case "Maintenance":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "Security":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "Equipment":
        return `${baseClasses} bg-purple-100 text-purple-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <>
      <AdminNavigation setView={setView} currentView="adminReports" />
      <div className="ml-[250px] w-[calc(100%-250px)] flex flex-col h-screen overflow-hidden bg-gray-50">
        <header className="bg-white px-6 py-4 border-b border-gray-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#CC0000]">Reports Management</h1>
              <p className="text-gray-600">View and manage all system reports</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full flex items-center">
                <Clock className="mr-1" size={14} />
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </header>

        {successMessage && (
          <div className={`mx-6 mt-4 p-4 rounded-lg flex items-center ${
            successMessage.includes("❌") 
              ? "bg-red-50 border-l-4 border-red-500 text-red-700" 
              : "bg-green-50 border-l-4 border-green-500 text-green-700"
          }`}>
            {successMessage.includes("❌") ? (
              <AlertTriangle className="mr-3" size={20} />
            ) : (
              <CheckCircle className="mr-3" size={20} />
            )}
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        <div className="flex-1 overflow-auto p-6">
          {/* Search and Filter Section */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search reports by name, category or details..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="appearance-none pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "All" ? "All Categories" : cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>

              <div className="flex items-center space-x-2">
 


                <button
                  onClick={fetchReports}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" ref={reportRef}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reported By
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reported On
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        <div className="flex justify-center">
                          <RefreshCw className="animate-spin mr-2" size={18} />
                          Loading reports...
                        </div>
                      </td>
                    </tr>
                  ) : filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <FileText className="text-gray-400 mb-2" size={24} />
                          No reports found matching your criteria
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((rep, index) => (
                      <tr key={rep._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {rep.reportedBy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(rep.category)}>
                            {rep.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                          <div className="line-clamp-2">{rep.details}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(rep.created_at || rep.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => openModal(rep)}
                              className="text-blue-600 hover:text-blue-900 p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                              title="View details"
                            >
                              <FileText size={18} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(rep)}
                              className="text-red-600 hover:text-red-900 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                              title="Delete report"
                            >
                              <Trash2 size={18} />
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
      </div>

      {/* View Details Modal */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Report Details</h2>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Reported By</h3>
                    <p className="mt-1 text-sm text-gray-900">{selectedReport.reportedBy}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Category</h3>
                    <p className="mt-1">
                      <span className={getStatusBadge(selectedReport.category)}>
                        {selectedReport.category}
                      </span>
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Floor</h3>
                    <p className="mt-1 text-sm text-gray-900">{selectedReport.floor || "N/A"}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Room</h3>
                    <p className="mt-1 text-sm text-gray-900">{selectedReport.room || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Reported On</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedReport.created_at || selectedReport.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500">Details</h3>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-line">{selectedReport.details}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && reportToDelete && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center bg-red-50 px-6 py-4 border-b border-red-100">
              <h2 className="text-xl font-semibold text-red-800 flex items-center">
                <AlertTriangle className="mr-2" size={20} />
                Confirm Archive
              </h2>
              <button 
                onClick={closeDeleteModal}
                className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to archive this report? You can restore it later from the archive.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-800">{reportToDelete.category} Report</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{reportToDelete.details}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Reported by {reportToDelete.reportedBy} on {new Date(reportToDelete.created_at || reportToDelete.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteReport(reportToDelete._id)}
                className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Yes, Archive Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminReports;