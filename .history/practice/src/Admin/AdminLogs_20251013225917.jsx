import React, { useEffect, useState } from "react";
import AdminNavigation from "./AdminNavigation";

// 📦 Import libraries
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";

function AdminLogs({ setView }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔎 Filters & Sorting
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // desc = newest first
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'console'

  const fetchLogs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/logs");
      if (!res.ok) throw new Error("Failed to fetch logs");
      const data = await res.json();
      setLogs(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(); // initial load
    const interval = setInterval(fetchLogs, 2000); // 🔄 refresh every 2s
    return () => clearInterval(interval);
  }, []);

  // 📌 Apply filters
  const filteredLogs = logs
    .filter((log) => {
      const logDate = new Date(log.createdAt);

      const matchesSearch =
        log.userName?.toLowerCase().includes(search.toLowerCase()) ||
        log.action?.toLowerCase().includes(search.toLowerCase()) ||
        log.details?.toLowerCase().includes(search.toLowerCase());

      const matchesStart = startDate ? logDate >= new Date(startDate) : true;
      const matchesEnd = endDate ? logDate <= new Date(endDate) : true;

      return matchesSearch && matchesStart && matchesEnd;
    })
    .sort((a, b) =>
      sortOrder === "desc"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

  // 📥 Export as CSV
  const exportCSV = () => {
    const headers = ["User", "ID Number", "Action", "Details", "Date"];
    const rows = filteredLogs.map((log) => [
      log.userName || "System",
      log.id_number || "—",
      log.action,
      log.details || "—",
      new Date(log.createdAt).toLocaleString("en-PH", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([decodeURIComponent(encodeURI(csvContent))], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(blob, `activity_logs_${Date.now()}.csv`);
  };

  // 📥 Export as PDF
  const exportPDF = () => {
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "A4" });

      doc.setFontSize(14);
      doc.text("Activity Logs", 40, 40);

      autoTable(doc, {
        startY: 60,
        head: [["User", "ID Number", "Action", "Details", "Date"]],
        body: filteredLogs.map((log) => [
          log.userName || "System",
          log.id_number || "—",
          log.action || "",
          log.details || "—",
          new Date(log.createdAt).toLocaleString("en-PH", {
            dateStyle: "medium",
            timeStyle: "short",
          }),
        ]),
        styles: { fontSize: 10, cellPadding: 6, overflow: "linebreak" },
        columnStyles: { 3: { cellWidth: 200 } },
        margin: { left: 40, right: 40 },
      });

      doc.save(`activity_logs_${Date.now()}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Failed to generate PDF. Check the console for details.");
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setSortOrder("desc");
    setShowCalendar(false);
  };

  return (
    <>
      <AdminNavigation setView={setView} currentView="adminLogs" />
      <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gray-50">
        {/* ✅ Simple Header */}
        <header className="bg-white px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-[#CC0000]">Activity Logs</h1>
          <p className="text-gray-600">Review user and system activities</p>
          {error && (
            <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
        </header>

        {/* ✅ Controls Section */}
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Left Side - Filters */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Search Input */}
              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border rounded-lg pl-10 pr-4 py-2.5 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Date Range */}
              <div className="relative">
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="border rounded-lg px-4 py-2.5 text-sm flex items-center gap-2 bg-white hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Date Range</span>
                </button>

                {/* Calendar Dropdown */}
                {showCalendar && (
                  <div className="absolute top-full left-0 mt-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100 z-10 w-80">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-gray-800">Select Date Range</h2>
                      <button 
                        onClick={() => setShowCalendar(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="border rounded-lg px-3 py-2 text-sm w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="border rounded-lg px-3 py-2 text-sm w-full"
                        />
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between">
                        <button
                          onClick={() => {
                            setStartDate("");
                            setEndDate("");
                          }}
                          className="text-sm text-gray-600 hover:text-gray-800"
                        >
                          Clear Dates
                        </button>
                        <button
                          onClick={() => setShowCalendar(false)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sort Order */}
              <button
                onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
                className="bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                {sortOrder === "desc" ? "Newest First" : "Oldest First"}
              </button>
            </div>

            {/* Right Side - Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "table" 
                      ? "bg-white text-gray-900 shadow-sm" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode("console")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "console" 
                      ? "bg-white text-gray-900 shadow-sm" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Console
                </button>
              </div>

              {/* Export Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={exportCSV}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                >
                  CSV
                </button>
                <button
                  onClick={exportPDF}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                >
                  PDF
                </button>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* ✅ Logs Container - Scrollable Area Only */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#CC0000]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No logs found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
            </div>
          ) : viewMode === "table" ? (
            // Table View - Scrollable Container
            <div className="bg-white shadow-sm rounded-lg h-[90rem] overflow-hidden">
              <div className="overflow-x-auto">
                <div className="max-h-[60vh] overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 whitespace-nowrap">
                            <div className="text-xs font-medium text-gray-900">
                              {log.userName || "System"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {log.id_number || "—"}
                            </div>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            <div className="text-xs text-gray-900">{log.action}</div>
                          </td>
                          <td className="px-6 py-3">
                            <div className="text-xs text-gray-900 max-w-md truncate">{log.details || "No details provided"}</div>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            <div className="text-xs text-gray-500">
                              {new Date(log.createdAt).toLocaleString("en-PH", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            // Console View - Scrollable Container
            <div className="bg-gray-900 text-gray-300 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
                <div className="text-sm font-medium">Console Logs</div>
                <div className="text-xs text-gray-500">
                  {filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-4">
                <div className="space-y-2">
                  {filteredLogs.map((log) => (
                    <div key={log._id} className="flex items-start gap-4 hover:bg-gray-800 px-3 py-2 rounded text-sm">
                      <div className="text-gray-500 text-xs w-20 flex-shrink-0 mt-0.5">
                        {new Date(log.createdAt).toLocaleTimeString("en-PH", {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-blue-400 font-medium">
                          {log.userName || "System"}
                        </div>
                        <div className="text-green-400">
                          {log.action}
                        </div>
                        <div className="text-gray-300 md:col-span-2">
                          {log.details || "No details"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default AdminLogs;