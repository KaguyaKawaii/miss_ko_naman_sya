import React, { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import AdminNews from "./AdminNews";
import AdminLogs from "./AdminLogs";

function AdminDashboard({ setView }) {
  const [summaryData, setSummaryData] = useState({
    reservations: 0,
    users: 0,
    rooms: 0,
    messages: 0,
    pendingReservations: 0,
    reports: 0,
    pendingReports: 0
  });
  const [newsList, setNewsList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [recentActivity, setRecentActivity] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [logs, setLogs] = useState([]);
  const [reports, setReports] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [currentSubView, setCurrentSubView] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch all data in parallel
      const [
        summaryRes,
        newsRes,
        roomsRes,
        availableRoomsRes,
        logsRes,
        messagesRes,
        usersRes,
        reservationsRes,
        reportsRes
      ] = await Promise.allSettled([
        axios.get("http://localhost:5000/api/admin/summary"),
        axios.get("http://localhost:5000/news/active"),
        axios.get("http://localhost:5000/api/rooms"),
        axios.get("http://localhost:5000/api/rooms/available"),
        axios.get("http://localhost:5000/api/logs"),
        axios.get("http://localhost:5000/api/messages"),
        axios.get("http://localhost:5000/api/users"),
        axios.get("http://localhost:5000/api/reservations"),
        axios.get("http://localhost:5000/reports")
      ]);

      // Process summary data
      const summary = summaryRes.status === 'fulfilled' ? summaryRes.value.data : {};
      const usersData = usersRes.status === 'fulfilled' ? usersRes.value.data : [];
      const reservationsData = reservationsRes.status === 'fulfilled' ? reservationsRes.value.data : [];
      const messagesData = messagesRes.status === 'fulfilled' ? messagesRes.value.data : [];
      const allRoomsData = roomsRes.status === 'fulfilled' ? roomsRes.value.data : [];
      const reportsData = reportsRes.status === 'fulfilled' ? reportsRes.value.data : [];

      setSummaryData({
        reservations: summary.reservations || reservationsData.length || 0,
        users: summary.users || usersData.length || 0,
        rooms: summary.rooms || allRoomsData.length || 0,
        messages: summary.messages || messagesData.length || 0,
        pendingReservations: summary.pendingReservations || 
          (Array.isArray(reservationsData) ? reservationsData.filter(r => r.status === 'pending').length : 0),
        reports: reportsData.length || 0,
        pendingReports: Array.isArray(reportsData) ? reportsData.filter(r => r.status === 'Pending').length : 0
      });

      // Set other data
      setNewsList(newsRes.status === 'fulfilled' ? newsRes.value.data : []);
      setAllRooms(allRoomsData);
      setAvailableRooms(availableRoomsRes.status === 'fulfilled' ? availableRoomsRes.value.data : []);
      setReservations(reservationsData);
      setReports(reportsData);
      
      const logsData = logsRes.status === 'fulfilled' ? logsRes.value.data : [];
      setLogs(logsData);

      // Update recent activity
      const recentLogs = Array.isArray(logsData) ? logsData.slice(0, 5) : [];
      setRecentActivity(recentLogs.map(log => ({
        id: log._id,
        action: log.action,
        time: formatTimeAgo(new Date(log.createdAt)),
        user: log.userName || "System",
        details: log.details
      })));

    } catch (error) {
      console.error("Error fetching all data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const refreshData = () => {
    fetchAllData();
  };

  useEffect(() => {
    fetchAllData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handlePostNews = async () => {
    if (!newsTitle.trim() || !newsContent.trim()) {
      alert("Both Title and Content are required.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/news", {
        title: newsTitle,
        content: newsContent,
      });
      alert("News posted successfully!");
      setNewsTitle("");
      setNewsContent("");
      setShowNewsModal(false);
      refreshData();
    } catch (err) {
      console.error("Error posting news:", err);
      alert("Failed to post news.");
    }
  };

  const quickActions = [
    { id: "adminReservation", label: "Reservations" },
    { id: "adminUsers", label: "Users" },
    { id: "adminRoom", label: "Rooms" },
    { id: "adminMessage", label: "Messages" },
    { id: "adminNews", label: "News" },
    { id: "adminReports", label: "Reports" },
    { id: "adminNotifications", label: "Notifications" }
  ];

  const exportCSV = () => {
    const headers = ["User", "Action", "Details", "Date"];
    const rows = logs.map((log) => [
      log.userName || "System",
      log.action,
      log.details || "—",
      new Date(log.createdAt).toLocaleString(),
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dashboard_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getOccupiedRoomsCount = () => {
    return allRooms.length - availableRooms.length;
  };

  const getNewUsersThisWeek = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return logs.filter(log => 
      log.action === "User registered" && 
      new Date(log.createdAt) > oneWeekAgo
    ).length;
  };

  // SVG Icons
  const CalendarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
    </svg>
  );

  const UsersIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A3.02 3.02 0 0016.95 6h-2.2c-.79 0-1.53.43-1.92 1.12L11.27 12 9 12v10h3v-6h2v6h3zm-4.33-10l1.13-3.33c.13-.4.51-.67.94-.67h1.52c.43 0 .81.27.94.67L19.33 12h-3.66zM6 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-8H6v8h4zm-8 0v-8H2v8h4zm2-18c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2z"/>
    </svg>
  );

  const HomeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  );

  const AlertTriangleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L1 21h22L12 2zm0 4l7.5 13h-15L12 6zm-1 4v6h2v-6h-2zm0 8v2h2v-2h-2z"/>
    </svg>
  );

  const RefreshIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
    </svg>
  );

  const ChevronRightIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
    </svg>
  );

  const FileTextIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
    </svg>
  );

  const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
  );

  const DownloadIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
    </svg>
  );

  // Render different views
  if (currentSubView === "news") {
    return <AdminNews setView={setView} admin={{}} />;
  }

  if (currentSubView === "logs") {
    return <AdminLogs setView={setView} />;
  }

  if (loading) {
    return (
      <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#CC0000] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm px-8 py-6 border-b border-gray-200/60 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#CC0000] mb-1">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, Administrator</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
            >
              <RefreshIcon className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <span className="text-sm font-medium text-gray-700 bg-white/80 px-4 py-2 rounded-lg border border-gray-200/60">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Reservations</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{summaryData.reservations}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <CalendarIcon />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200/60">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">{summaryData.pendingReservations}</span> pending approval
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Registered Users</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{summaryData.users}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-50 text-green-600">
                <UsersIcon />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200/60">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">{getNewUsersThisWeek()}</span> new this week
              </p>
            </div>
          </div>

          

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Reports & Issues</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{summaryData.reports}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                <AlertTriangleIcon />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200/60">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">{summaryData.pendingReports}</span> pending resolution
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/60">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => setView(action.id)}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-200/60 hover:border-blue-500 hover:bg-blue-50/50 transition-all group backdrop-blur-sm"
                  >
                    <div className="text-left flex-1">
                      <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{action.label}</p>
                    </div>
                    <ChevronRightIcon className="text-gray-400 group-hover:text-blue-600" />
                  </button>
                ))}
              </div>
            </div>

            {/* Recent News */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/60">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Recent News</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentSubView("news")}
                    className="flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FileTextIcon className="mr-2" />
                    Manage News
                  </button>
                 
                </div>
              </div>
              
              {newsList.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">No news posted yet</p>
                  <button 
                    onClick={() => setShowNewsModal(true)}
                    className="text-blue-600 text-sm font-medium hover:underline"
                  >
                    Create your first news post
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {newsList.slice(0, 3).map((news) => (
                    <div key={news._id} className="p-4 rounded-xl border border-gray-200/60 hover:shadow-sm transition-shadow backdrop-blur-sm bg-white/50">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-800">{news.title}</h3>
                        <span className="text-xs text-gray-500">
                          {new Date(news.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {news.content.replace(/<[^>]*>/g, '')}
                      </p>
                     
                    </div>
                  ))}
                  {newsList.length > 3 && (
                    <button 
                      onClick={() => setCurrentSubView("news")}
                      className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mt-2 backdrop-blur-sm"
                    >
                      View all news ({newsList.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Calendar - Compact Version */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/60">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Calendar</h2>
                <span className="text-sm text-gray-500">
                  {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="scale-90 origin-top -my-4 -mx-2">
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  className="border-0 w-full font-bold react-calendar-compact"
                  tileClassName={({ date }) => {
                    const today = new Date();
                    if (
                      date.getDate() === today.getDate() &&
                      date.getMonth() === today.getMonth() &&
                      date.getFullYear() === today.getFullYear()
                    ) {
                      return "bg-blue-600 text-white font-bold rounded-lg";
                    }
                    return null;
                  }}
                />
              </div>
             
            </div>

            {/* Activity Logs */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/60">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
                <div className="flex gap-2">
                  <button
                    onClick={exportCSV}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Export CSV"
                  >
                    <DownloadIcon />
                  </button>
                  <button
                    onClick={() => setCurrentSubView("logs")}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View All
                  </button>
                </div>
              </div>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No recent activity
                  </div>
                ) : (
                  logs.slice(0, 8).map((log) => (
                    <div key={log._id} className="flex items-start">
                      <div className="flex-shrink-0 mt-1 mr-3">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">
                          {log.action}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {log.details}
                        </p>
                        <div className="flex justify-between mt-1">
                          <p className="text-xs text-gray-500">{log.userName || "System"}</p>
                          <p className="text-xs text-gray-400">
                            {formatTimeAgo(new Date(log.createdAt))}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {logs.length > 8 && (
                  <button 
                    onClick={() => setCurrentSubView("logs")}
                    className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors backdrop-blur-sm"
                  >
                    View all activity logs ({logs.length})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </main>
  );
}

export default AdminDashboard;