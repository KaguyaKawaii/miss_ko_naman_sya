import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Users,
  Calendar as CalendarIcon,
  MessageSquare,
  ChevronRight,
  Bell,
  AlertCircle,
  Activity,
  Room,
  Check,
  X,
  Clock,
} from "lucide-react";

// API service module
const apiService = {
  baseURL: "http://localhost:5000/api",
  
  async get(url) {
    try {
      const response = await axios.get(`${this.baseURL}${url}`);
      return response.data;
    } catch (error) {
      console.error(`API Error (GET ${url}):`, error.response?.data || error.message);
      return null;
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

function StaffDashboard({ staff, setView, unreadCounts, onRefreshCounts }) {
  const [summaryData, setSummaryData] = useState({
    reservations: 0,
    users: 0,
    pendingReservations: 0,
    messages: 0,
    notifications: 0
  });
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]); // Add rooms state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [recentActivity, setRecentActivity] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [roomAvailability, setRoomAvailability] = useState({});

  const normalizeFloorName = (floorName) => {
    if (!floorName) return "";
    const normalized = floorName.toLowerCase().trim();

    if (normalized.includes("2nd") || normalized.includes("second")) return "2nd Floor";
    if (normalized.includes("3rd") || normalized.includes("third")) return "3rd Floor";
    if (normalized.includes("4th") || normalized.includes("fourth")) return "4th Floor";
    if (normalized.includes("5th") || normalized.includes("fifth")) return "5th Floor";
    if (normalized.includes("ground")) return "Ground Floor";

    return floorName;
  };

  // Enhanced data fetching with better error handling
  const fetchAllData = useCallback(async () => {
    if (!staff?._id || !staff?.floor) {
      console.log("No staff ID or floor available");
      return;
    }

    try {
      setRefreshing(true);
      setError(null);
      
      // Use CORRECT API endpoints that match your backend
      const endpoints = [
        { key: 'reservations', url: `/reservations` },
        { key: 'messages', url: `/messages/staff-total-unread/${staff._id}` },
        { key: 'notifications', url: `/notifications/unread-count/${staff._id}` },
        { key: 'users', url: '/users' },
        { key: 'rooms', url: '/rooms' } // ADD THIS - get rooms from your backend
      ];

      const fetchPromises = endpoints.map(endpoint => 
        apiService.get(endpoint.url).catch(error => {
          console.log(`Endpoint ${endpoint.url} not available, using fallback`);
          // Return empty data instead of error object for better handling
          if (endpoint.key === 'reservations') return [];
          if (endpoint.key === 'users') return [];
          if (endpoint.key === 'rooms') return []; // Return empty array for rooms if endpoint fails
          return { count: 0 };
        })
      );

      const results = await Promise.all(fetchPromises);
      
      // Process results
      const data = {};
      endpoints.forEach((endpoint, index) => {
        data[endpoint.key] = results[index];
      });

      processFetchedData(data);

      // Also trigger counts refresh for navigation
      if (onRefreshCounts) {
        onRefreshCounts();
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try refreshing.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [staff, onRefreshCounts]);

  const processFetchedData = (data) => {
    // Helper functions
    const safeLength = (array) => (Array.isArray(array) ? array.length : 0);
    const filterByStatus = (array, status) => 
      Array.isArray(array) ? array.filter(item => item.status === status).length : 0;

    // Process reservations - filter by staff's floor
    const allReservations = Array.isArray(data.reservations) ? data.reservations : [];
    const normalizedStaffFloor = normalizeFloorName(staff.floor);
    
    console.log('📊 Processing reservations:', {
      totalReservations: allReservations.length,
      staffFloor: staff.floor,
      normalizedStaffFloor: normalizedStaffFloor
    });
    
    const filteredReservations = allReservations.filter(reservation => {
      const reservationFloor = reservation.location || reservation.floor || "";
      const normalizedReservationFloor = normalizeFloorName(reservationFloor);
      
      const matches = normalizedReservationFloor === normalizedStaffFloor;
      
      if (matches) {
        console.log('✅ Reservation matches floor:', {
          room: reservation.roomName,
          floor: reservationFloor,
          normalizedFloor: normalizedReservationFloor
        });
      }
      
      return matches;
    });

    console.log('📈 Filtered reservations:', filteredReservations.length);

    // Process rooms - filter by staff's floor
    const allRooms = Array.isArray(data.rooms) ? data.rooms : [];
    const filteredRooms = allRooms.filter(room => {
      const roomFloor = room.floor || "";
      const normalizedRoomFloor = normalizeFloorName(roomFloor);
      return normalizedRoomFloor === normalizedStaffFloor && room.isActive !== false;
    });

    console.log('🏠 Filtered rooms:', filteredRooms.length);
    setRooms(filteredRooms);

    // Process users - get all users and EXCLUDE staff users
    const allUsers = Array.isArray(data.users) ? data.users : [];
    
    // Filter out staff users - only count regular users (students and faculty)
    const regularUsers = allUsers.filter(user => 
      user.role !== 'staff' && user.role !== 'Staff'
    );
    
    const totalRegularUsers = safeLength(regularUsers);

    console.log('👥 User statistics:', {
      totalUsers: allUsers.length,
      regularUsers: regularUsers.length,
      staffUsers: allUsers.length - regularUsers.length
    });

    // Process messages - handle different response formats
    let unreadMessagesCount = 0;
    if (typeof data.messages === 'number') {
      unreadMessagesCount = data.messages;
    } else if (data.messages && typeof data.messages.count === 'number') {
      unreadMessagesCount = data.messages.count;
    }

    // Process notifications - handle different response formats
    let unreadNotificationsCount = 0;
    if (typeof data.notifications === 'number') {
      unreadNotificationsCount = data.notifications;
    } else if (data.notifications && typeof data.notifications.count === 'number') {
      unreadNotificationsCount = data.notifications.count;
    }

    // Use navigation counts if available, otherwise use calculated counts
    const finalMessagesCount = unreadCounts?.messages !== undefined ? unreadCounts.messages : unreadMessagesCount;
    const finalNotificationsCount = unreadCounts?.notifications !== undefined ? unreadCounts.notifications : unreadNotificationsCount;

    // Update summary data
    setSummaryData({
      reservations: safeLength(filteredReservations),
      users: totalRegularUsers,
      pendingReservations: filterByStatus(filteredReservations, 'Pending'),
      messages: finalMessagesCount,
      notifications: finalNotificationsCount
    });

    // Set reservations data
    const sortedReservations = filteredReservations.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt) : 0;
      const bTime = b.createdAt ? new Date(b.createdAt) : 0;
      return bTime - aTime;
    });
    
    setReservations(sortedReservations);

    // Update recent activity with available data
    updateRecentActivity(sortedReservations);
  };

  // Calculate room availability when date or reservations change
  useEffect(() => {
    if (!staff?.floor || !reservations.length || !rooms.length) return;

    const staffFloor = normalizeFloorName(staff.floor);
    
    // Filter reservations for this staff's floor
    const floorReservations = reservations.filter(reservation => {
      const reservationFloor = reservation.location || reservation.floor || "";
      const normalizedReservationFloor = normalizeFloorName(reservationFloor);
      return normalizedReservationFloor === staffFloor;
    });

    // Calculate availability for the selected date
    const availability = {};
    floorReservations.forEach(reservation => {
      const roomName = reservation.roomName || reservation.room || 'Unknown Room';
      const reservationDate = new Date(reservation.datetime);
      
      // Check if reservation is on the selected date
      if (reservationDate.toDateString() === selectedDate.toDateString()) {
        if (!availability[roomName]) {
          availability[roomName] = [];
        }
        availability[roomName].push({
          time: reservationDate.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          status: reservation.status,
          user: reservation.userId?.name || 'Unknown User'
        });
      }
    });

    setRoomAvailability(availability);
  }, [selectedDate, staff, reservations, rooms]);

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

  // Custom tile content to show availability indicators
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;

    const staffFloor = normalizeFloorName(staff.floor);
    const floorReservations = reservations.filter(reservation => {
      const reservationFloor = reservation.location || reservation.floor || "";
      const normalizedReservationFloor = normalizeFloorName(reservationFloor);
      return normalizedReservationFloor === staffFloor;
    });

    const reservationsOnDate = floorReservations.filter(reservation => {
      const reservationDate = new Date(reservation.datetime);
      return reservationDate.toDateString() === date.toDateString();
    });

    if (reservationsOnDate.length === 0) return null;

    return (
      <div className="flex justify-center mt-1">
        <div className="flex space-x-1">
          {reservationsOnDate.slice(0, 3).map((_, index) => (
            <div
              key={index}
              className="w-1 h-1 bg-blue-500 rounded-full"
            />
          ))}
          {reservationsOnDate.length > 3 && (
            <div className="w-1 h-1 bg-gray-400 rounded-full" />
          )}
        </div>
      </div>
    );
  };

  const updateRecentActivity = (reservationsData) => {
    const reservationActivities = reservationsData.slice(0, 3).map((r) => ({
      id: r._id || `res-${Date.now()}`,
      action: `Reservation in ${r.roomName || r.room || 'Unknown Room'}`,
      time: r.datetime ? new Date(r.datetime).toLocaleDateString() : "Unknown date",
      user: r.userId?.name || "Unknown",
      type: "reservation",
      status: r.status
    }));

    // Add some mock activities for demo (remove in production)
    const mockActivities = [
      {
        id: 'mock-1',
        action: 'System maintenance completed',
        time: new Date().toLocaleDateString(),
        user: 'System',
        type: 'notification',
      },
      {
        id: 'mock-2', 
        action: 'New user registered',
        time: new Date().toLocaleDateString(),
        user: 'System',
        type: 'notification',
      }
    ];

    setRecentActivity([...reservationActivities, ...mockActivities].slice(0, 4));
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
    { id: "staffReservation", icon: <CalendarIcon size={18} />, label: "Reservations", count: summaryData.reservations },
    { id: "staffNotification", icon: <Bell size={18} />, label: "Notifications", count: summaryData.notifications },
    { id: "staffMessages", icon: <MessageSquare size={18} />, label: "Messages", count: summaryData.messages },
  ];

  const handleQuickAction = (actionId) => {
    if (setView) {
      setView(actionId);
    }
  };

  // Custom navigation label to format month and year
  const navigationLabel = ({ date }) => {
    return (
      <span className="text-sm font-semibold text-gray-900">
        {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </span>
    );
  };

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
            <h1 className="text-3xl font-bold text-[#CC0000] mb-1">
              {staff?.floor || "Staff"} Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {staff?.name || "Staff"}
            </p>
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

      {/* Content */}
      <div className="p-8">
        {/* Enhanced Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Reservations Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-500 text-sm font-medium mb-2">
                  Total Reservations
                </p>
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="text-3xl font-bold text-gray-800">
                    {summaryData.reservations}
                  </p>
                  {summaryData.pendingReservations > 0 && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                      +{summaryData.pendingReservations} pending
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  For {staff?.floor || "your floor"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                <CalendarIcon size={24} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  {summaryData.pendingReservations === 0 ? (
                    "All reservations processed"
                  ) : (
                    <>
                      <span className="font-semibold text-yellow-600">
                        {summaryData.pendingReservations}
                      </span>{" "}
                      need approval
                    </>
                  )}
                </p>
                {summaryData.pendingReservations > 0 && (
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>
          </div>

          {/* Users Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-2">Total Users</p>
                <p className="text-3xl font-bold text-gray-800 mb-2">
                  {summaryData.users}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Users size={12} />
                  <span>Students and Faculty only</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
                <Users size={24} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Excluding staff accounts
                </p>
                <div className={`w-2 h-2 rounded-full ${
                  summaryData.users > 0 ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
              </div>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-2">
                  Notifications
                </p>
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="text-3xl font-bold text-gray-800">
                    {summaryData.notifications}
                  </p>
                  {summaryData.notifications > 0 && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                      Unread
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  Your unread notifications
                </p>
              </div>
              <div className={`p-3 rounded-xl shadow-lg ${
                summaryData.notifications > 0 
                  ? 'bg-gradient-to-br from-red-500 to-red-600 animate-pulse' 
                  : 'bg-gradient-to-br from-purple-500 to-purple-600'
              } text-white`}>
                <Bell size={24} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  {summaryData.notifications === 0 ? (
                    "All clear!"
                  ) : (
                    "Requires your attention"
                  )}
                </p>
                {summaryData.notifications > 0 && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                )}
              </div>
            </div>
          </div>

          {/* Messages Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-2">
                  Messages
                </p>
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="text-3xl font-bold text-gray-800">
                    {summaryData.messages}
                  </p>
                  {summaryData.messages > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                      Unread
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  Your unread messages
                </p>
              </div>
              <div className={`p-3 rounded-xl shadow-lg ${
                summaryData.messages > 0 
                  ? 'bg-gradient-to-br from-amber-500 to-amber-600' 
                  : 'bg-gradient-to-br from-gray-500 to-gray-600'
              } text-white`}>
                <MessageSquare size={24} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  {summaryData.messages === 0 ? (
                    "No new messages"
                  ) : (
                    "Unread messages waiting"
                  )}
                </p>
                {summaryData.messages > 0 && (
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.id)}
                    className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"
                  >
                    <div className="mr-3 p-2 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600">
                      {action.icon}
                    </div>
                    <div className="text-left flex-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                          {action.label}
                        </p>
                        {action.count > 0 && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            {action.count}
                          </span>
                        )}
                      </div>
                      <ChevronRight size={16} className="text-gray-400 mt-1 group-hover:text-blue-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Reservations */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Recent Reservations - {staff?.floor}
                </h2>
                <button 
                  onClick={() => setView("staffReservation")}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  View all
                </button>
              </div>
              {reservations.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-500">No reservations found for {staff?.floor}.</p>
                  <p className="text-sm text-gray-400 mt-1">All reservations will appear here once created.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reservations.slice(0, 5).map((r) => (
                    <div
                      key={r._id}
                      className="p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-gray-800">
                          {r.roomName || r.room}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          r.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          r.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          r.status === 'Ongoing' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {r.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Reserved by {r.userId?.name || "Unknown"}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">
                          {r.datetime ? new Date(r.datetime).toLocaleDateString() : "Unknown date"}
                        </p>
                        <button 
                          onClick={() => setView("staffReservation")}
                          className="text-blue-600 text-xs hover:underline"
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Calendar with Room Availability */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Room Availability - {staff?.floor}
              </h2>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                className="border-0 w-full mb-4"
                minDetail="month"
                nextLabel={
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                }
                prevLabel={
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                }
                navigationLabel={navigationLabel}
                tileContent={tileContent}
                tileClassName={({ date, view }) => {
                  const today = new Date();
                  if (
                    view === 'month' &&
                    date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear()
                  ) {
                    return "bg-blue-50 text-blue-600 font-semibold rounded-lg";
                  }
                  return null;
                }}
              />
              
              {/* Room Availability List */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Availability for {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </h3>
                
                {rooms.length === 0 ? (
                  <div className="text-center py-4">
                    <Room className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-gray-500 text-sm">No rooms found for {staff?.floor}.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {rooms.map(room => {
                      const availability = getAvailabilityStatus(room);
                      
                      return (
                        <div
                          key={room._id}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center">
                            <Room size={16} className="text-gray-500 mr-2" />
                            <span className="text-sm font-medium text-gray-800">{room.room}</span>
                          </div>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            availability.status === 'available' 
                              ? 'bg-green-100 text-green-800'
                              : availability.status === 'booked'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {availability.status === 'available' && <Check size={12} className="mr-1" />}
                            {availability.status === 'booked' && <X size={12} className="mr-1" />}
                            {availability.status === 'pending' && <Clock size={12} className="mr-1" />}
                            {availability.status === 'available' ? 'Available' : 
                             availability.status === 'booked' ? 'Booked' : 'Pending'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-3 text-xs">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Available</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Booked</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Pending</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Recent Activity - {staff?.floor}
              </h2>
              {recentActivity.length === 0 ? (
                <div className="text-center py-4">
                  <Activity className="mx-auto text-gray-400 mb-2" size={24} />
                  <p className="text-gray-500 text-sm">No recent activity on your floor</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'reservation' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'message' ? 'bg-green-100 text-green-600' :
                        activity.type === 'notification' ? 'bg-purple-100 text-purple-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {activity.type === 'reservation' ? <CalendarIcon size={14} /> :
                         activity.type === 'message' ? <MessageSquare size={14} /> :
                         activity.type === 'notification' ? <Bell size={14} /> :
                         <Activity size={14} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                        <p className="text-xs text-gray-500">by {activity.user}</p>
                        <p className="text-xs text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Actions */}
            {summaryData.pendingReservations > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200">
                <div className="flex items-center mb-3">
                  <AlertCircle className="text-red-500 mr-2" size={18} />
                  <h2 className="text-lg font-semibold text-gray-800">
                    Pending Actions - {staff?.floor}
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  You have {summaryData.pendingReservations} reservation{summaryData.pendingReservations !== 1 ? 's' : ''} on your floor requiring your attention.
                </p>
                <button 
                  onClick={() => setView("staffReservation")}
                  className="w-full py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Review Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default StaffDashboard;