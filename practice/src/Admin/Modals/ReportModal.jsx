// ReportModal.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const ReportModal = ({ reportId, onClose, onReportUpdated }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [assigning, setAssigning] = useState(false);

  const API_URL = "http://localhost:5000/reports";
  const USERS_API = "http://localhost:5000/api/users";

  // Helper function to extract valid report ID
  const extractReportId = (reportId) => {
    if (!reportId) return null;
    
    // If it's already a string (valid ObjectId)
    if (typeof reportId === 'string' && reportId.length === 24) {
      return reportId;
    }
    
    // If it's an object with _id
    if (typeof reportId === 'object' && reportId._id) {
      return reportId._id;
    }
    
    // If it's an object with $oid (MongoDB format)
    if (typeof reportId === 'object' && reportId.$oid) {
      return reportId.$oid;
    }
    
    // If it's an object that might have been stringified
    if (typeof reportId === 'string' && reportId.includes('_id')) {
      try {
        const parsed = JSON.parse(reportId);
        return parsed._id || parsed.$oid || null;
      } catch (e) {
        return null;
      }
    }
    
    return null;
  };

  // 🔹 Fetch single report
  useEffect(() => {
    const fetchReport = async () => {
      const validReportId = extractReportId(reportId);
      
      if (!validReportId) {
        setError("Invalid report ID format");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        console.log("Fetching report with ID:", validReportId);
        const res = await axios.get(`${API_URL}/${validReportId}`);
        setReport(res.data);
        setActionTaken(res.data.actionTaken || "");
        setSelectedStaff(res.data.assignedTo?._id || "");
      } catch (err) {
        console.error("Failed to fetch report", err);
        setError("Failed to load report details");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  // 🔹 Fetch staff list
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await axios.get(`${USERS_API}?role=Staff`);
        setStaffList(res.data.users || []);
      } catch (err) {
        console.error("Failed to fetch staff", err);
        setStaffList([]);
      }
    };

    fetchStaff();
  }, []);

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
      const updatedReport = await axios.get(`${API_URL}/${report._id}`);
      setReport(updatedReport.data);
      
      alert("Report assigned successfully!");
      onReportUpdated?.();
    } catch (err) {
      console.error("Error assigning staff:", err);
      alert("Failed to assign staff");
    } finally {
      setAssigning(false);
    }
  };

  // 🔹 Resolve Report
  const handleResolveReport = async () => {
    if (!report || !actionTaken.trim()) {
      alert("Please describe the action taken before resolving.");
      return;
    }

    try {
      setActionLoading(true);
      await axios.put(`${API_URL}/resolve/${report._id}`, {
        actionTaken: actionTaken.trim(),
      });
      
      // Refresh report data
      const updatedReport = await axios.get(`${API_URL}/${report._id}`);
      setReport(updatedReport.data);
      
      alert("Report resolved successfully!");
      onReportUpdated?.();
    } catch (err) {
      console.error("Error resolving report:", err);
      alert("Failed to resolve report");
    } finally {
      setActionLoading(false);
    }
  };

  // 🔹 Archive Report
  const handleArchiveReport = async () => {
    if (!report) return;
    if (!confirm("Are you sure you want to archive this report?")) return;

    try {
      setActionLoading(true);
      await axios.put(`${API_URL}/archive/${report._id}`);
      alert("Report archived successfully!");
      onReportUpdated?.();
      onClose();
    } catch (err) {
      console.error("Error archiving report:", err);
      alert("Failed to archive report");
    } finally {
      setActionLoading(false);
    }
  };

  if (!reportId) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#CC0000]">Report Details</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            disabled={actionLoading || assigning}
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <p className="text-gray-500">Loading report details...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <button 
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          ) : report ? (
            <>
              {/* Status Badge */}
              <div className="mb-6">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    report.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : report.status === "Resolved"
                      ? "bg-green-100 text-green-800"
                      : report.status === "Archived"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  Status: {report.status}
                </span>
              </div>

              {/* Report Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Category</h3>
                  <p className="text-lg font-semibold">{report.category || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Reported By</h3>
                  <p className="text-lg font-semibold">{report.reportedBy || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Floor</h3>
                  <p className="text-lg font-semibold">{report.floor || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Room</h3>
                  <p className="text-lg font-semibold">{report.room || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Assigned To</h3>
                  <p className="text-lg font-semibold">
                    {report.assignedTo ? report.assignedTo.name : "Unassigned"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date Reported</h3>
                  <p className="text-lg font-semibold">
                    {report.createdAt ? new Date(report.createdAt).toLocaleString() : "N/A"}
                  </p>
                </div>
              </div>

              {/* Assign Staff Section */}
              {report.status !== "Resolved" && report.status !== "Archived" && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to Staff
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedStaff}
                      onChange={(e) => setSelectedStaff(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                      disabled={assigning}
                    >
                      <option value="">Select Staff Member</option>
                      {staffList.map((staff) => (
                        <option key={staff._id} value={staff._id}>
                          {staff.name} - {staff.department || "Staff"}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssignStaff}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={assigning || !selectedStaff}
                    >
                      {assigning ? "Assigning..." : "Assign"}
                    </button>
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Issue Details</h3>
                <p className="text-gray-800 bg-gray-50 p-4 rounded-lg min-h-[100px]">
                  {report.details || "No details provided"}
                </p>
              </div>

              {/* Action Taken Section */}
              {report.status === "Resolved" ? (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Action Taken</h3>
                  <p className="text-gray-800 bg-green-50 p-4 rounded-lg">
                    {report.actionTaken || "No action details provided"}
                  </p>
                </div>
              ) : (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action Taken (Required for Resolution)
                  </label>
                  <textarea
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value)}
                    placeholder="Describe what action was taken to resolve this report..."
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC0000] focus:border-transparent resize-none"
                    disabled={actionLoading}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
                  disabled={actionLoading || assigning}
                >
                  Close
                </button>

                {report.status !== "Archived" && report.status !== "Resolved" && (
                  <>
                    <button
                      onClick={handleArchiveReport}
                      className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={actionLoading || assigning}
                    >
                      {actionLoading ? "Archiving..." : "Archive"}
                    </button>

                    <button
                      onClick={handleResolveReport}
                      className="px-6 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-[#A30000] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={actionLoading || assigning || !actionTaken.trim()}
                    >
                      {actionLoading ? "Resolving..." : "Resolve Report"}
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Report not found.</p>
              <button 
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;