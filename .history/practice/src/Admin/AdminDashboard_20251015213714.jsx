import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import AdminNews from "./AdminNews";
import AdminLogs from "./AdminLogs";

// API service module for better organization
const apiService = {
  baseURL: "http://localhost:5000",
  
  async get(url) {
    try {
      const response = await axios.get(`${this.baseURL}${url}`);
      return response.data;
    } catch (error) {
      console.error(`API Error (GET ${url}):`, error);
      throw error;
    }
  },

  async post(url, data) {
    try {
      const response = await axios.post(`${this.baseURL}${url}`, data);
      return response.data;
    } catch (error) {
      console.error(`API Error (POST ${url}):`, error);
      throw error;
    }
  }
};

function AdminDashboard({ setView }) {
  const [summaryData, setSummaryData] = useState({
    reservations: 0,
    users: 0,
    messages: 0,
    pendingReservations: 0,
    reports: 0,
    pendingReports: 0
  });
  const [newsList, setNewsList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [recentActivity, setRecentActivity] = useState([]);
  const [logs, setLogs] = useState([]);
  const [reports, setReports] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [currentSubView, setCurrentSubView] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Enhanced data fetching with better error handling
  const fetchAllData = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      // Define all API endpoints to fetch
      const endpoints = [
        { key: 'summary', url: '/api/admin/summary' },
        { key: 'news', url: '/news/active' },
        { key: 'logs', url: '/api/logs' },
        { key: 'messages', url: '/api/messages' },
        { key: 'users', url: '/api/users' },
        { key: 'reservations', url: '/api/reservations' },
        { key: 'reports', url: '/reports' }
      ];

      // Fetch all data in parallel
      const fetchPromises = endpoints.map(endpoint => 
        apiService.get(endpoint.url).catch(error => ({ error: true, message: error.message }))
      );

      const results = await Promise.all(fetchPromises);
      
      // Process results
      const data = {};
      endpoints.forEach((endpoint, index) => {
        data[endpoint.key] = results[index];
      });

      // Process and validate data
      processFetchedData(data);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try refreshing.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const processFetchedData = (data) => {
    // Helper function to safely get array length
    const safeLength = (array) => (Array.isArray(array) ? array.length : 0);
    
    // Helper function to filter by status
    const filterByStatus = (array, status) => 
      Array.isArray(array) ? array.filter(item => item.status === status).length : 0;

    // Process summary data
    const summary = data.summary?.error ? {} : data.summary;
    const usersData = data.users?.error ? [] : data.users;
    const reservationsData = data.reservations?.error ? [] : data.reservations;
    const messagesData = data.messages?.error ? [] : data.messages;
    const reportsData = data.reports?.error ? [] : data.reports;

    setSummaryData({
      reservations: summary.reservations || safeLength(reservationsData),
      users: summary.users || safeLength(usersData),
      messages: summary.messages || safeLength(messagesData),
      pendingReservations: summary.pendingReservations || filterByStatus(reservationsData, 'pending'),
      reports: safeLength(reportsData),
      pendingReports: filterByStatus(reportsData, 'Pending')
    });

    // Set other data states
    setNewsList(data.news?.error ? [] : data.news);
    setReservations(reservationsData);
    setReports(reportsData);
    
    const logsData = data.logs?.error ? [] : data.logs;
    setLogs(logsData);

    // Update recent activity
    updateRecentActivity(logsData);
  };

  const updateRecentActivity = (logsData) => {
    const recentLogs = Array.isArray(logsData) ? logsData.slice(0, 5) : [];
    setRecentActivity(recentLogs.map(log => ({
      id: log._id,
      action: log.action,
      time: formatTimeAgo(new Date(log.createdAt)),
      user: log.userName || "System",
      details: log.details
    })));
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
  }, [fetchAllData]);

  const quickActions = [
    { id: "adminReservation", label: "Reservations", description: "Manage room bookings and approvals" },
    { id: "adminUsers", label: "Users", description: "View and manage user accounts" },
    { id: "adminRoom", label: "Rooms", description: "Configure room settings and availability" },
    { id: "adminMessage", label: "Messages", description: "Monitor and respond to user messages" },
    { id: "adminNews", label: "News", description: "Create and manage announcements" },
    { id: "adminReports", label: "Reports", description: "View system reports and analytics" },
    { id: "adminNotifications", label: "Notifications", description: "Configure system alerts" }
  ];

  const getNewUsersThisWeek = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return logs.filter(log => 
      log.action === "User registered" && 
      new Date(log.createdAt) > oneWeekAgo
    ).length;
  };

  // Render different views
  if (currentSubView === "news") {
    return <AdminNews setView={setView} admin={{}} />;
  }

  if (currentSubView === "logs") {
    return <AdminLogs setView={setView} />;
  }

  if (loading) {
    return (
      <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#CC0000] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
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
              <svg className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <span className="text-sm font-medium text-gray-700 bg-white px-4 py-2 rounded-lg border border-gray-200">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Reservation Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Total Reservations</p>
                <p className="text-2xl font-bold text-gray-800">{summaryData.reservations}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
                </svg>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">{summaryData.pendingReservations}</span> pending approval
              </p>
            </div>
          </div>

          {/* Users Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Registered Users</p>
                <p className="text-2xl font-bold text-gray-800">{summaryData.users}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 text-green-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A3.02 3.02 0 0016.95 6h-2.2c-.79 0-1.53.43-1.92 1.12L11.27 12 9 12v10h3v-6h2v6h3zm-4.33-10l1.13-3.33c.13-.4.51-.67.94-.67h1.52c.43 0 .81.27.94.67L19.33 12h-3.66zM6 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-8H6v8h4zm-8 0v-8H2v8h4zm2-18c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2z"/>
                </svg>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">{getNewUsersThisWeek()}</span> new this week
              </p>
            </div>
          </div>

          {/* Reports Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Reports & Issues</p>
                <p className="text-2xl font-bold text-gray-800">{summaryData.reports}</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L1 21h22L12 2zm0 4l7.5 13h-15L12 6zm-1 4v6h2v-6h-2zm0 8v2h2v-2h-2z"/>
                </svg>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">{summaryData.pendingReports}</span> pending resolution
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="xl:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => setView(action.id)}
                    className="flex flex-col p-5 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800 group-hover:text-blue-700">
                        {action.label}
                      </h3>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600 group-hover:text-blue-600">
                      {action.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent News */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Recent News</h2>
                <button
                  onClick={() => setCurrentSubView("news")}
                  className="flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                  </svg>
                  Manage News
                </button>
              </div>
              
              {newsList.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  <p className="text-gray-500 mb-2">No news posted yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {newsList.slice(0, 3).map((news) => (
                    <div key={news._id} className="p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-800 text-lg">{news.title}</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {new Date(news.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {news.content.replace(/<[^>]*>/g, '')}
                      </p>
                    </div>
                  ))}
                  {newsList.length > 3 && (
                    <button 
                      onClick={() => setCurrentSubView("news")}
                      className="w-full py-3 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200"
                    >
                      View all news ({newsList.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-8">
            {/* Calendar */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Calendar</h2>
                <span className="text-sm text-gray-500 font-medium">
                  {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                className="border-0 w-full font-medium"
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

            {/* Activity Logs */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
                <button
                  onClick={() => setCurrentSubView("logs")}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    No recent activity
                  </div>
                ) : (
                  logs.slice(0, 8).map((log) => (
                    <div key={log._id} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex-shrink-0 mt-1 mr-4">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                          {log.action}
                        </p>
                        <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                          {log.details}
                        </p>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-gray-500 font-medium">{log.userName || "System"}</p>
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
                    className="w-full py-3 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200 mt-4"
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