import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminNavigation from "./AdminNavigation";
import { 
  FileText, 
  Printer, 
  Download, 
  Search, 
  X, 
  Trash2,
  ChevronDown,
  RefreshCw
} from "lucide-react";
import { useReactToPrint } from 'react-to-print';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReportsPDF from './ReportsPDF'; // You'll need to create this component

function AdminReports({ setView }) {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const reportRef = React.useRef();

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

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
  });

  const filteredReports = reports.filter((report) => {
    const matchesSearch = 
      report.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === "All" || report.category === filter;
    
    return matchesSearch && matchesFilter;
  });

  // Extract unique categories for filter
  const categories = ["All", ...new Set(reports.map(report => report.category))];

  return (
    <>
      <AdminNavigation setView={setView} currentView="adminReports" />
      <div className="ml-[250px] w-[calc(100%-250px)] flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#CC0000]">Reports Management</h1>
              <p className="text-gray-600">View and manage all system reports</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Filters and Actions */}
          <div className="bg-white p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search reports..."
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
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Print"
                >
                  <Printer size={16} />
                </button>

                <PDFDownloadLink 
                  document={<ReportsPDF reports={filteredReports} />} 
                  fileName="reports.pdf"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download size={16} />
                </PDFDownloadLink>

                <button
                  onClick={fetchReports}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw size={16} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Reports Table */}
          <div className="flex-1 overflow-y-auto p-6" ref={reportRef}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">#</th>
                    <th className="px-6 py-3 text-left font-medium">Reported By</th>
                    <th className="px-6 py-3 text-left font-medium">Category</th>
                    <th className="px-6 py-3 text-left font-medium">Details</th>
                    <th className="px-6 py-3 text-left font-medium">Reported On</th>
                    <th className="px-6 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        Loading reports...
                      </td>
                    </tr>
                  ) : filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No reports found
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((rep, index) => (
                      <tr key={rep._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{rep.reportedBy}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            rep.category === "Maintenance" 
                              ? "bg-blue-100 text-blue-800" 
                              : rep.category === "Security" 
                              ? "bg-red-100 text-red-800" 
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {rep.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="line-clamp-2">{rep.details}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(rep.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleDeleteReport(rep._id)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
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
    </>
  );
}

export default AdminReports;