import React, { useEffect, useState } from "react";
import axios from "axios";

const ReportModal = ({ reportId, onClose, onReportUpdated }) => {
  if (!reportId) return null;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
    const [assigning, setAssigning] = useState(null);
  

  const API_URL = "http://localhost:5000/reports";
  const USERS_API = "http://localhost:5000/users";

  // 🔹 Fetch single report
  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${API_URL}/${reportId}`);
        setReport(res.data);
        setActionTaken(res.data.actionTaken || "");
        setSelectedStaff(res.data.assignedTo?._id || "");
      } catch (err) {
        console.error("Failed to fetch report", err);
        setError("Failed to load report");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId]);

  // 🔹 Fetch staff list (only staff users) - FIXED ENDPOINT
  const fetchStaff = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users?role=Staff");
      setStaffList(res.data.users || []); // ✅ FIX: use res.data.users
    } catch (err) {
      console.error("Failed to fetch staff", err);
      setStaffList([]);
    }
  };

  // 🔹 Assign staff - FIXED FUNCTION
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
    if (!report || !actionTaken.trim()) {
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

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#CC0000]">Report Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-gray-500">Loading report...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
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
                  <p className="text-lg">{report.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Reported By</h3>
                  <p className="text-lg">{report.reportedBy}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Floor</h3>
                  <p className="text-lg">{report.floor}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Room</h3>
                  <p className="text-lg">{report.room}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Assigned To</h3>
                  <p className="text-lg">
                    {report.assignedTo ? report.assignedTo.name : "Unassigned"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date Reported</h3>
                  <p className="text-lg">{new Date(report.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Assign Staff */}
              {report.status !== "Archived" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign Staff
                  </label>
                  <select
                        className="border rounded px-2 py-1"
                        onChange={(e) =>
                          assignStaff(report._id, e.target.value)
                        }
                      >
                        <option value="">Select Staff</option>
                        {staffList.map((staff) => (
                          <option key={staff._id} value={staff._id}>
                            {staff.name}
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
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500">Details</h3>
                <p className="text-lg bg-gray-50 p-4 rounded-lg mt-1">{report.details}</p>
              </div>

              {/* Action Taken Section */}
              {report.status === "Resolved" ? (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500">Action Taken</h3>
                  <p className="text-lg bg-green-50 p-4 rounded-lg mt-1">
                    {report.actionTaken}
                  </p>
                </div>
              ) : (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action Taken
                  </label>
                  <textarea
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value)}
                    placeholder="Describe what action was taken to resolve this report..."
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                    disabled={actionLoading}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  disabled={actionLoading}
                >
                  Cancel
                </button>

                {report.status !== "Archived" && (
                  <button
                    onClick={handleArchiveReport}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Archiving..." : "Archive"}
                  </button>
                )}

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
            </>
          ) : (
            <p className="text-gray-500">Report not found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;