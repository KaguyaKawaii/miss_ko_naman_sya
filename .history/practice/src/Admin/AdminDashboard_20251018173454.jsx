import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import AdminNews from "./AdminNews";
import AdminLogs from "./AdminLogs";
import {
  Home,
  MapPin,
  Check,
  X,
  Clock,
  Users,
  Calendar as CalendarIcon,
  MessageSquare,
  Bell,
  FileText,
  Settings,
  AlertCircle,
  RefreshCw,
  Mail
} from "lucide-react";

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
    pendingReports: 0,
    unreadMessages: 0,
    unreadUserMessages: 0,
    unreadStaffMessages: 0
  });
  const [newsList, setNewsList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [recentActivity, setRecentActivity] = useState([]);
  const [logs, setLogs] = useState([]);
  const [reports, setReports] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [currentSubView, setCurrentSubView] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [roomAvailability, setRoomAvailability] = useState({});
  const [unreadBreakdown, setUnreadBreakdown] = useState([]);

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
        { key: 'reports', url: '/reports' },
        { key: 'rooms', url: '/api/rooms' }
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

      // Now fetch unread messages separately with better error handling
      try {
        const adminRecipients = await apiService.get('/api/messages/admin/recipients');
        data.adminRecipients = adminRecipients;
      } catch (recipientsError) {
        console.warn('Could not fetch admin recipients, using fallback:', recipientsError.message);
        data.adminRecipients = { error: true, fallback: true };
      }

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
    const roomsData = data.rooms?.error ? [] : data.rooms;
    const adminRecipients = data.adminRecipients;

    // Calculate unread messages - with fallback if endpoint fails
    let totalUnread = 0;
    let unreadUserMessages = 0;
    let unreadStaffMessages = 0;
    let unreadConversations = [];

    if (adminRecipients && !adminRecipients.error) {
      // Normal case: endpoint works
      totalUnread = Array.isArray(adminRecipients) 
        ? adminRecipients.reduce((sum, recipient) => sum + (recipient.unreadCount || 0), 0)
        : 0;

      unreadUserMessages = Array.isArray(adminRecipients)
        ? adminRecipients
            .filter(recipient => recipient.type === 'user')
            .reduce((sum, recipient) => sum + (recipient.unreadCount || 0), 0)
        : 0;

      unreadStaffMessages = Array.isArray(adminRecipients)
        ? adminRecipients
            .filter(recipient => recipient.type === 'staff')
            .reduce((sum, recipient) => sum + (recipient.unreadCount || 0), 0)
        : 0;

      unreadConversations = Array.isArray(adminRecipients)
        ? adminRecipients
            .filter(recipient => recipient.unreadCount > 0)
            .sort((a, b) => b.unreadCount - a.unreadCount)
            .slice(0, 5)
        : [];
    } else if (adminRecipients?.fallback) {
      // Fallback case: estimate from messages data
      console.log('Using fallback for unread messages count');
      const allMessages = Array.isArray(messagesData) ? messagesData : [];
      totalUnread = allMessages.filter(msg => 
        msg.receiver === 'admin' && msg.read === false
      ).length;
      
      // For fallback, we can't distinguish between user and staff without the recipients endpoint
      unreadUserMessages = Math.floor(totalUnread * 0.7); // Estimate 70% from users
      unreadStaffMessages = Math.floor(totalUnread * 0.3); // Estimate 30% from staff
    }

    setSummaryData({
      reservations: summary.reservations || safeLength(reservationsData),
      users: summary.users || safeLength(usersData),
      messages: summary.messages || safeLength(messagesData),
      pendingReservations: summary.pendingReservations || filterByStatus(reservationsData, 'pending'),
      reports: safeLength(reportsData),
      pendingReports: filterByStatus(reportsData, 'Pending'),
      unreadMessages: totalUnread,
      unreadUserMessages,
      unreadStaffMessages
    });

    // Set other data states
    setNewsList(data.news?.error ? [] : data.news);
    setReservations(reservationsData);
    setReports(reportsData);
    setRooms(Array.isArray(roomsData) ? roomsData.filter(room => room.isActive !== false) : []);
    
    const logsData = data.logs?.error ? [] : data.logs;
    setLogs(logsData);

    // Set unread breakdown
    setUnreadBreakdown(unreadConversations);

    // Update recent activity
    updateRecentActivity(logsData);
  };

  // Room availability calculation
  useEffect(() => {
    if (!reservations.length || !rooms.length) return;

    const availability = {};
    
    // Initialize all rooms as available
    rooms.forEach(room => {
      availability[room.room] = [];
    });

    // Process reservations for the selected date
    reservations.forEach(reservation => {
      const roomName = reservation.roomName || reservation.room;
      const reservationDate = new Date(reservation.datetime);
      const selectedDateStart = new Date(selectedDate);
      selectedDateStart.setHours(0, 0, 0, 0);
      const selectedDateEnd = new Date(selectedDate);
      selectedDateEnd.setHours(23, 59, 59, 999);
      
      // Check if reservation is on the selected date
      if (reservationDate >= selectedDateStart && reservationDate <= selectedDateEnd) {
        if (!availability[roomName]) {
          availability[roomName] = [];
        }
        availability[roomName].push({
          time: reservationDate.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          status: reservation.status,
          user: reservation.userId?.name || reservation.userName || 'Unknown User'
        });
      }
    });

    setRoomAvailability(availability);
  }, [selectedDate, reservations, rooms]);

  const getAvailabilityStatus = (room) => {
    const roomName = room.room;
    const bookings = roomAvailability[roomName] || [];
    
    if (bookings.length === 0) {
      return { status: 'available', message: 'Available all day' };
    }
    
    const pending = bookings.filter(b => b.status === 'Pending').length;
    const approved = bookings.filter(b => b.status === 'Approved' || b.status === 'Ongoing').length;
    
    if (approved > 0) {
      return { 
        status: 'booked', 
        message: `Booked (${approved} reservation${approved > 1 ? 's' : ''})` 
      };
    }
    
    if (pending > 0) {
      return { 
        status: 'pending', 
        message: `Pending approval (${pending})` 
      };
    }
    
    return { status: 'available', message: 'Available' };
  };

  const getRoomBookings = (room) => {
    const roomName = room.room;
    
    // Try exact match first
    if (roomAvailability[roomName]) {
      return roomAvailability[roomName];
    }
    
    // Try case-insensitive match
    const roomKey = Object.keys(roomAvailability).find(
      key => key.toLowerCase() === roomName.toLowerCase()
    );
    
    return roomKey ? roomAvailability[roomKey] : [];
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
    { id: "adminReservation", icon: <CalendarIcon size={18} />, label: "Reservations", color: "blue" },
    { id: "adminUsers", icon: <Users size={18} />, label: "Users", color: "green" },
    { id: "adminRoom", icon: <Home size={18} />, label: "Rooms", color: "purple" },
    { id: "adminMessage", icon: <MessageSquare size={18} />, label: "Messages", color: "amber" },
    { id: "adminNews", icon: <FileText size={18} />, label: "News", color: "indigo" },
    { id: "adminReports", icon: <AlertCircle size={18} />, label: "Reports", color: "red" },
    { id: "adminNotifications", icon: <Bell size={18} />, label: "Notifications", color: "cyan" },
    { id: "adminSettings", icon: <Settings size={18} />, label: "Settings", color: "gray" }
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

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
      green: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',
      purple: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100',
      amber: 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100',
      red: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
      cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200 hover:bg-cyan-100',
      gray: 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
    };
    return colors[color] || colors.gray;
  };

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white px-8 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#CC0000]">Admin Dashboard</h1>
            <p className="text-gray-600 text-sm">Welcome back, Administrator</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <span className="text-sm text-gray-700 bg-gray-100 px-3 py-2 rounded-lg border">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="mx-8 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle size={16} className="text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900 text-sm"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Reservation Card */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium mb-1">Reservations</p>
                <p className="text-xl font-bold text-gray-800">{summaryData.reservations}</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <CalendarIcon size={20} />
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-amber-600">{summaryData.pendingReservations}</span> pending
              </p>
            </div>
          </div>

          {/* Users Card */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium mb-1">Users</p>
                <p className="text-xl font-bold text-gray-800">{summaryData.users}</p>
              </div>
              <div className="p-2 rounded-lg bg-green-50 text-green-600">
                <Users size={20} />
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-green-600">{getNewUsersThisWeek()}</span> new this week
              </p>
            </div>
          </div>

          {/* Messages Card - Updated with Unread Count */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium mb-1">Messages</p>
                <p className="text-xl font-bold text-gray-800">{summaryData.messages}</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <MessageSquare size={20} />
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                <span className={`font-medium ${summaryData.unreadMessages > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {summaryData.unreadMessages}
                </span> unread messages
              </p>
            </div>
          </div>

          {/* Reports Card */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium mb-1">Reports</p>
                <p className="text-xl font-bold text-gray-800">{summaryData.reports}</p>
              </div>
              <div className="p-2 rounded-lg bg-red-50 text-red-600">
                <AlertCircle size={20} />
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-red-600">{summaryData.pendingReports}</span> pending
              </p>
            </div>
          </div>
        </div>

        {/* Unread Messages Overview Card */}
        {summaryData.unreadMessages > 0 && (
          <div className="bg-white p-5 rounded-lg border border-amber-200 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-amber-800 flex items-center">
                <Mail className="mr-2" size={20} />
                Unread Messages Overview
              </h2>
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                {summaryData.unreadMessages} total unread
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-blue-700 text-sm font-medium">From Users</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">
                    {summaryData.unreadUserMessages}
                  </span>
                </div>
              </div>
              
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <span className="text-purple-700 text-sm font-medium">From Staff</span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold">
                    {summaryData.unreadStaffMessages}
                  </span>
                </div>
              </div>
              
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <div className="flex items-center justify-between">
                  <span className="text-amber-700 text-sm font-medium">Total Unread</span>
                  <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold">
                    {summaryData.unreadMessages}
                  </span>
                </div>
              </div>
            </div>

            {unreadBreakdown.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Top Conversations with Unread Messages:</h3>
                <div className="space-y-2">
                  {unreadBreakdown.map((conversation, index) => (
                    <div key={conversation._id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{conversation.name || 'Unknown User'}</p>
                          <p className="text-xs text-gray-500 capitalize">
                            {conversation.type || 'user'} • {conversation.department || 'No department'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold mr-2">
                          {conversation.unreadCount} unread
                        </span>
                        <button
                          onClick={() => setView("adminMessage")}
                          className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <MessageSquare className="mx-auto mb-2 text-gray-400" size={24} />
                <p className="text-sm">No conversation details available</p>
                <button
                  onClick={() => setView("adminMessage")}
                  className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                >
                  Check Messages
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Quick Actions & Room Availability */}
          <div className="xl:col-span-2 space-y-6">
            {/* Compact Quick Actions */}
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => setView(action.id)}
                    className={`flex flex-col items-center p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${getColorClasses(action.color)}`}
                  >
                    <div className="p-2 rounded-lg bg-white border mb-2">
                      {action.icon}
                    </div>
                    <span className="text-xs font-medium text-center">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Room Availability */}
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Room Availability</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded border">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              {rooms.length === 0 ? (
                <div className="text-center py-6">
                  <MapPin className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-500 text-sm">No rooms found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {rooms.map(room => {
                    const availability = getAvailabilityStatus(room);
                    const bookings = getRoomBookings(room);
                    
                    return (
                      <div
                        key={room._id}
                        className="p-3 rounded-lg border border-gray-200 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            <Home size={16} className="text-gray-500 mr-2" />
                            <div>
                              <h3 className="font-semibold text-gray-800 text-sm">{room.room}</h3>
                              <p className="text-xs text-gray-500">{room.floor || 'No floor specified'}</p>
                            </div>
                          </div>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            availability.status === 'available' 
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : availability.status === 'booked'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          }`}>
                            {availability.status === 'available' && <Check size={12} className="mr-1" />}
                            {availability.status === 'booked' && <X size={12} className="mr-1" />}
                            {availability.status === 'pending' && <Clock size={12} className="mr-1" />}
                            {availability.status === 'available' ? 'Free' : 
                             availability.status === 'booked' ? 'Booked' : 'Pending'}
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-2">{availability.message}</p>
                        
                        {bookings.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs font-medium text-gray-700 mb-1">Bookings:</p>
                            <div className="space-y-1">
                              {bookings.slice(0, 2).map((booking, index) => (
                                <div key={index} className="flex justify-between items-center text-xs">
                                  <span className="text-gray-600 font-medium">{booking.time}</span>
                                  <span className="text-gray-500 truncate ml-2 max-w-[100px]">
                                    {booking.user}
                                  </span>
                                  <span className={`px-1 py-0.5 rounded text-xs ${
                                    booking.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                    booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {booking.status}
                                  </span>
                                </div>
                              ))}
                              {bookings.length > 2 && (
                                <p className="text-xs text-gray-500 text-center">+{bookings.length - 2} more</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Availability Legend */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Status</h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  <div className="flex items-center px-2 py-1 bg-green-50 rounded border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    <span className="text-green-800">Available</span>
                  </div>
                  <div className="flex items-center px-2 py-1 bg-red-50 rounded border border-red-200">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                    <span className="text-red-800">Booked</span>
                  </div>
                  <div className="flex items-center px-2 py-1 bg-yellow-50 rounded border border-yellow-200">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                    <span className="text-yellow-800">Pending</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent News */}
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Recent News</h2>
                <button
                  onClick={() => setCurrentSubView("news")}
                  className="flex items-center px-3 py-1 text-sm font-medium rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FileText size={14} className="mr-1" />
                  Manage
                </button>
              </div>
              
              {newsList.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                  <FileText className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-500 text-sm">No news posted yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {newsList.slice(0, 3).map((news) => (
                    <div key={news._id} className="p-3 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800 text-sm">{news.title}</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {new Date(news.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                        {news.content.replace(/<[^>]*>/g, '')}
                      </p>
                    </div>
                  ))}
                  {newsList.length > 3 && (
                    <button 
                      onClick={() => setCurrentSubView("news")}
                      className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200"
                    >
                      View all news ({newsList.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Calendar & Activity */}
          <div className="space-y-6">
            {/* Calendar */}
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Calendar</h2>
                <span className="text-sm text-gray-500 font-medium">
                  {selectedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                className="border-0 w-full text-sm"
                tileClassName={({ date }) => {
                  const today = new Date();
                  if (
                    date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear()
                  ) {
                    return "bg-blue-600 text-white font-semibold rounded";
                  }
                  return null;
                }}
              />
            </div>

            {/* Activity Logs */}
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
                <button
                  onClick={() => setCurrentSubView("logs")}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <FileText className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-sm">No recent activity</p>
                  </div>
                ) : (
                  logs.slice(0, 6).map((log) => (
                    <div key={log._id} className="flex items-start pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex-shrink-0 mt-1 mr-3">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                          {log.action}
                        </p>
                        <p className="text-sm text-gray-600 mb-2 leading-relaxed line-clamp-2">
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
                {logs.length > 6 && (
                  <button 
                    onClick={() => setCurrentSubView("logs")}
                    className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200 mt-2"
                  >
                    View all activity ({logs.length})
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