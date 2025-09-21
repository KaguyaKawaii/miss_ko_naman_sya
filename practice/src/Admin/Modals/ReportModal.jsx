import React, { useEffect, useState } from "react";
import axios from "axios";

function ReportModal({ reportId, onClose }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = "http://localhost:5000/reports";

  // 🔹 Fetch single report
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`${API_URL}/${reportId}`);
        setReport(res.data);
      } catch (err) {
        console.error("Failed to fetch report", err);
        setError("Failed to load report");
      } finally {
        setLoading(false);
      }
    };
    if (reportId) fetchReport();
  }, [reportId]);

  // 🔹 Take Action (archive report)
  const handleTakeAction = async () => {
    if (!report) return;
    try {
      setActionLoading(true);
      await axios.post(`${API_URL}/archive/${report._id}`);
      alert("Report archived successfully!");
      onClose(); // close modal after action
    } catch (err) {
      console.error("Error taking action:", err);
      alert("Failed to take action on this report");
    } finally {
      setActionLoading(false);
    }
  };

  if (!reportId) return null;

  return (
    <div className="fixed inset-0   flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p className="text-lg">
                    {new Date(report.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800">{report.details}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  onClick={onClose}
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-[#AA0000] disabled:opacity-50"
                  onClick={handleTakeAction}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Processing..." : "Take Action"}
                </button>
              </div>
            </>
          ) : (
            <p className="text-red-500">Failed to load report</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportModal;
