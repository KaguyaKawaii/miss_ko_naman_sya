import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavigation from "../AdminNavigation";

function ArchivedReports({ setView }) {
  const [archivedReports, setArchivedReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch archived reports
  const fetchArchivedReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/reports/archived"); // ✅ FIXED PATH
      setArchivedReports(res.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch archived reports:", err);
      alert("Failed to load archived reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedReports();
  }, []);

  // ✅ Restore report
  const handleRestore = async (id) => {
    if (!window.confirm("Restore this report?")) return;
    try {
      await axios.put(`http://localhost:5000/reports/restore/${id}`);
      alert("✅ Report restored successfully.");
      fetchArchivedReports();
    } catch (err) {
      console.error("❌ Failed to restore report:", err);
      alert("Failed to restore report.");
    }
  };

  // ✅ Delete report permanently
  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this report? This cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:5000/reports/${id}`);
      alert("✅ Report permanently deleted.");
      fetchArchivedReports();
    } catch (err) {
      console.error("❌ Failed to delete report:", err);
      alert("Failed to delete report.");
    }
  };

  return (
    <>
      <AdminNavigation setView={setView} currentView="adminArchivedReports" />
      <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gray-50">
        <header className="bg-white px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-[#CC0000]">Archived Reports</h1>
          <p className="text-gray-600">View and manage archived reports</p>
        </header>
        <div className="p-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[calc(100vh-180px)] overflow-y-auto">
            {loading ? (
              <p className="text-gray-500">Loading archived reports...</p>
            ) : archivedReports.length === 0 ? (
              <p className="text-gray-500">No archived reports found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="p-3 text-left">Reported By</th>
                      <th className="p-3 text-left">Category</th>
                      <th className="p-3 text-left">Details</th>
                      <th className="p-3 text-left">Floor</th>
                      <th className="p-3 text-left">Room</th>
                      <th className="p-3 text-left">Archived On</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archivedReports.map((report) => (
                      <tr
                        key={report._id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="p-3 text-gray-700">{report.reportedBy}</td>
                        <td className="p-3 font-medium text-gray-800">{report.category}</td>
                        <td className="p-3">{report.details}</td>
                        <td className="p-3">{report.floor}</td>
                        <td className="p-3">{report.room}</td>
                        <td className="p-3">
                          {report.updatedAt
                            ? new Date(report.updatedAt).toLocaleDateString("en-PH", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleRestore(report._id)}
                            className="text-[#CC0000] hover:underline mr-3"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => handleDelete(report._id)}
                            className="text-gray-600 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default ArchivedReports;
