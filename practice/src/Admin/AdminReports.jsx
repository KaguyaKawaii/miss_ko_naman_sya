import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminNavigation from "./AdminNavigation";

function AdminReports({ setView }) {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = () => {
    setIsLoading(true);
    axios
      .get("http://localhost:5000/reports")
      .then((res) => setReports(res.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  const handleDeleteReport = (id) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      axios
        .delete(`http://localhost:5000/reports/${id}`)
        .then(() => fetchReports())
        .catch((err) => console.error(err));
    }
  };

  return (
    <div>
      <AdminNavigation setView={setView} currentView="adminReports" />
      <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">
        <header className="bg-[#CC0000] text-white pl-5 h-[50px] flex items-center">
          <h1 className="text-2xl font-semibold">Reports</h1>
        </header>

        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          <div className="border border-gray-300 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#CC0000] text-white">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Reported By</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Details</th>
                  <th className="p-3">Reported On</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center p-4">
                      Loading…
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-4">
                      No reports found.
                    </td>
                  </tr>
                ) : (
                  reports.map((rep, index) => (
                    <tr
                      key={rep._id}
                      className="border-b hover:bg-gray-50 duration-150"
                    >
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">{rep.reportedBy}</td>
                      <td className="p-3">{rep.category}</td>
                      <td className="p-3">{rep.details}</td>
                      <td className="p-3">
                        {new Date(rep.created_at).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteReport(rep._id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminReports;
