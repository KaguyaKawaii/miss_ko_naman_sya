import { useEffect, useState } from "react";
import axios from "axios";
import StaffNavigation from "./StaffNavigation";
import { Bell, AlertCircle, Calendar, RefreshCw, Eye, X, Clock, CheckCircle, PlayCircle } from "lucide-react";
import ReservationModal from "./Modals/ReservationModal";

function StaffNotifications({ setView, staff }) {
  const [reservations, setReservations] = useState([]);
  const [reportNotifications, setReportNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [activeTab, setActiveTab] = useState("reservations"); // Changed to "reservations" first
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState(null);

  // Normalize floor names
  const normalizeFloor = (str) => {
    if (!str) return "";
    const lower = str.toLowerCase().trim();
    if (lower.includes("ground")) return "ground floor";
    if (lower.includes("first") || lower.includes("1st")) return "1st floor";
    if (lower.includes("second") || lower.includes("2nd")) return "2nd floor";
    if (lower.includes("third") || lower.includes("3rd")) return "3rd floor";
    if (lower.includes("fourth") || lower.includes("4th")) return "4th floor";
    if (lower.includes("fifth") || lower.includes("5th")) return "5th floor";
    return lower;
  };

  const fetchData = async () => {
    if (!staff?.floor) return;
    setLoading(true);
    try {
      // Reservations by staff floor
      const resReservations = await axios.get("http://localhost:5000/reservations");
      const staffFloor = normalizeFloor(staff.floor);
      const filtered = resReservations.data.filter(
        (reservation) => normalizeFloor(reservation.location) === staffFloor
      );
      const sorted = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setReservations(sorted);

      // Report notifications assigned to staff
      const resReports = await axios.get(`http://localhost:5000/reports/staff/${staff._id}`);
      setReportNotifications(resReports.data || []);
    } catch (err) {
      console.error("Failed to fetch staff notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [staff?.floor]);

  const formatDateTime = (dt) =>
    new Date(dt).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return formatDateTime(date);
  };

  const statusColor = (status) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800 border-green-200";
      case "Rejected":
      case "Cancelled":
      case "Expired": return "bg-red-100 text-red-800 border-red-200";
      case "Pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "In Progress":
      case "Ongoing": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Resolved": return "bg-green-50 text-green-800 border-green-100";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending": return <Clock className="w-4 h-4" />;
      case "In Progress":
      case "Ongoing": return <PlayCircle className="w-4 h-4" />;
      case "Resolved":
      case "Approved": return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const updateReportStatus = async (newStatus) => {
    if (!selectedReport) return;
    try {
      await axios.put(`http://localhost:5000/reports/${selectedReport._id}`, { status: newStatus });
      setReportNotifications((prev) =>
        prev.map((r) => (r._id === selectedReport._id ? { ...r, status: newStatus } : r))
      );
      
      const updated = { ...selectedReport, status: newStatus };
      setSelectedReport(updated);

      if (newStatus === "Resolved") {
        setTimeout(() => setSelectedReport(null), 1500);
      }
    } catch (err) {
      console.error("Failed to update report status:", err);
      alert("Failed to update report status. Please try again.");
    }
  };

  const handleApproveReservation = async (reservationId) => {
    setIsProcessing(true);
    setProcessingAction('approve');
    try {
      await axios.put(`http://localhost:5000/reservations/${reservationId}/status`, {
        status: "Approved"
      });
      // Update local state
      setReservations(prev => prev.map(res => 
        res._id === reservationId ? { ...res, status: "Approved" } : res
      ));
      setSelectedReservation(prev => prev ? { ...prev, status: "Approved" } : null);
      fetchData(); // Refresh data
    } catch (err) {
      console.error("Failed to approve reservation:", err);
      alert("Failed to approve reservation. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingAction(null);
    }
  };

  const handleRejectReservation = async (reservationId) => {
    setIsProcessing(true);
    setProcessingAction('reject');
    try {
      await axios.put(`http://localhost:5000/reservations/${reservationId}/status`, {
        status: "Rejected"
      });
      // Update local state
      setReservations(prev => prev.map(res => 
        res._id === reservationId ? { ...res, status: "Rejected" } : res
      ));
      setSelectedReservation(prev => prev ? { ...prev, status: "Rejected" } : null);
      fetchData(); // Refresh data
    } catch (err) {
      console.error("Failed to reject reservation:", err);
      alert("Failed to reject reservation. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingAction(null);
    }
  };

  const handleViewReservations = () => {
    setView("staffReservation");
  };

  if (loading) {
    return (
      <>
        <StaffNavigation setView={setView} currentView="staffNotification" />
        <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="animate-spin mx-auto mb-3 text-gray-400" size={32} />
            <p className="text-gray-500 text-lg">Loading notifications...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <StaffNavigation setView={setView} currentView="staffNotification" staff={staff} />
      <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gray-50">
        {/* Header - Keeping the same size */}
        <header className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#CC0000]">
                Staff Notifications
              </h1>
              <p className="text-gray-600">
                Reservations and Reports assigned to you
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
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

        <div className="p-6">
          {/* Tab Navigation - Reservations first */}
          <div className="flex space-x-1 mb-6 bg-white rounded-xl p-1 shadow-sm border border-gray-200 w-fit">
            <button
              onClick={() => setActiveTab("reservations")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === "reservations"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <Calendar size={18} />
              Reservations
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                activeTab === "reservations" ? "bg-white text-blue-600" : "bg-gray-100 text-gray-600"
              }`}>
                {reservations.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === "reports"
                  ? "bg-red-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <AlertCircle size={18} />
              Reports
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                activeTab === "reports" ? "bg-white text-red-600" : "bg-gray-100 text-gray-600"
              }`}>
                {reportNotifications.length}
              </span>
            </button>
          </div>

          {/* Reservations Tab - Now first */}
          {activeTab === "reservations" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <Calendar className="text-white" size={24} />
                  <h2 className="text-xl font-semibold text-white">Floor Reservations</h2>
                  <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                    {reservations.length} {reservations.length === 1 ? 'Reservation' : 'Reservations'}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                {reservations.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto text-gray-300 mb-4" size={64} />
                    <p className="text-gray-500 text-lg font-medium mb-2">No reservations for your floor</p>
                    <p className="text-gray-400">Reservations for {staff?.floor} will appear here</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {reservations.map((reservation) => (
                      <div
                        key={reservation._id}
                        className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-all hover:shadow-md bg-white group"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(reservation.status)}
                                <h3 className="font-semibold text-gray-800">
                                  {reservation.roomName} Reservation
                                </h3>
                              </div>
                              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1 ${statusColor(reservation.status)}`}>
                                {reservation.status}
                              </span>
                            </div>
                            
                            <p className="text-gray-600 mb-3">
                              Reserved by <span className="font-medium text-gray-800">{reservation.userId?.name || "Unknown"}</span>
                            </p>
                            
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>{formatDateTime(reservation.datetime)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Location:</span>
                                <span>{reservation.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <button
                              onClick={() => setSelectedReservation(reservation)}
                              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 group-hover:border-blue-300"
                            >
                              <Eye size={16} />
                              View Details
                            </button>
                            <button
                              onClick={handleViewReservations}
                              className="flex items-center gap-2 px-4 py-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors border border-green-200 group-hover:border-green-300"
                            >
                              View All
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-white" size={24} />
                  <h2 className="text-xl font-semibold text-white">Assigned Reports</h2>
                  <span className="bg-white text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                    {reportNotifications.length} {reportNotifications.length === 1 ? 'Report' : 'Reports'}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                {reportNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="mx-auto text-gray-300 mb-4" size={64} />
                    <p className="text-gray-500 text-lg font-medium mb-2">No reports assigned to you</p>
                    <p className="text-gray-400">You'll see reports here when they're assigned to you</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {reportNotifications.map((report) => (
                      <div
                        key={report._id}
                        className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-all hover:shadow-md bg-white group"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(report.status)}
                                <h3 className="font-semibold text-gray-800 text-lg">
                                  {report.category}
                                </h3>
                              </div>
                              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1 ${statusColor(report.status)}`}>
                                {report.status}
                              </span>
                            </div>
                            
                            <p className="text-gray-600 mb-3 leading-relaxed">
                              {report.details.length > 150 ? report.details.slice(0, 150) + "…" : report.details}
                            </p>
                            
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Location:</span>
                                <span>{report.floor || "N/A"} {report.room ? `• ${report.room}` : ""}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                <span>{formatRelativeTime(report.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="ml-4 flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 group-hover:border-blue-300"
                          >
                            <Eye size={16} />
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedReport.category}</h3>
              <p className="text-sm text-gray-600">
                Reported: {formatDateTime(selectedReport.createdAt)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Floor</p>
                  <p className="text-gray-800">{selectedReport.floor || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Room</p>
                  <p className="text-gray-800">{selectedReport.room || "N/A"}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Reported By</p>
                  <p className="text-gray-800">{selectedReport.reportedBy || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border flex items-center gap-1 w-fit ${statusColor(selectedReport.status)}`}>
                    {getStatusIcon(selectedReport.status)}
                    {selectedReport.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="font-semibold text-gray-700 mb-3 text-lg">Details</p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedReport.details}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Bell size={16} />
                <span>Last updated: {formatRelativeTime(selectedReport.updatedAt || selectedReport.createdAt)}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Close
                </button>

                {["Pending", "Assigned"].includes(selectedReport.status) && (
                  <button
                    onClick={() => updateReportStatus("In Progress")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                  >
                    <PlayCircle size={16} />
                    Accept & Start
                  </button>
                )}

                {["In Progress", "Ongoing"].includes(selectedReport.status) && (
                  <button
                    onClick={() => updateReportStatus("Resolved")}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Mark Resolved
                  </button>
                )}

                {selectedReport.status === "Resolved" && (
                  <button className="px-6 py-2 bg-gray-200 text-gray-600 rounded-lg cursor-not-allowed font-medium flex items-center gap-2" disabled>
                    <CheckCircle size={16} />
                    Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reservation Modal */}
      {selectedReservation && (
        <ReservationModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onApprove={() => handleApproveReservation(selectedReservation._id)}
          onReject={() => handleRejectReservation(selectedReservation._id)}
          isProcessing={isProcessing}
          processingAction={processingAction}
        />
      )}
    </>
  );
}

export default StaffNotifications;