import React, { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { 
  Users, 
  Calendar as CalendarIcon, 
  BookOpen, 
  MessageSquare, 
  FileText, 
  Bell, 
  PlusCircle,
  Clock,
  Activity,
  ChevronRight
} from "lucide-react";

function AdminDashboard({ setView }) {
  const [summaryData, setSummaryData] = useState({
    reservations: 0,
    users: 0,
    rooms: 0,
    messages: 0,
    pendingReservations: 0
  });
  const [newsList, setNewsList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [recentActivity, setRecentActivity] = useState([]);

  const refreshData = () => {
    axios
      .get("http://localhost:5000/api/admin/summary")
      .then((res) => {
        setSummaryData({
          reservations: res.data.reservations || 0,
          users: res.data.users || 0,
          rooms: res.data.rooms || 0,
          messages: res.data.messages || 0,
          pendingReservations: res.data.pendingReservations || 0
        });
      })
      .catch((err) => console.error("Error fetching summary:", err));

    axios
      .get("http://localhost:5000/news")
      .then((res) => setNewsList(res.data))
      .catch((err) => console.error("Error fetching news:", err));

    // Mock recent activity
    setRecentActivity([
      { id: 1, action: "New reservation created", time: "2 minutes ago", user: "John Doe" },
      { id: 2, action: "User registered", time: "15 minutes ago", user: "Jane Smith" },
      { id: 3, action: "Room updated", time: "1 hour ago", user: "System" },
      { id: 4, action: "News posted", time: "3 hours ago", user: "Admin" }
    ]);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handlePostNews = () => {
    if (!newsTitle.trim() || !newsContent.trim()) {
      alert("Both Title and Content are required.");
      return;
    }

    axios
      .post("http://localhost:5000/news", {
        title: newsTitle,
        content: newsContent,
      })
      .then(() => {
        alert("News posted successfully!");
        setNewsTitle("");
        setNewsContent("");
        setShowNewsModal(false);
        refreshData();
      })
      .catch((err) => {
        console.error("Error posting news:", err);
        alert("Failed to post news.");
      });
  };

  const quickActions = [
    { id: "adminReservation", icon: <CalendarIcon size={18} />, label: "Reservations" },
    { id: "adminUsers", icon: <Users size={18} />, label: "Users" },
    { id: "adminRoom", icon: <BookOpen size={18} />, label: "Rooms" },
    { id: "adminMessage", icon: <MessageSquare size={18} />, label: "Messages" },
    { id: "adminNews", icon: <FileText size={18} />, label: "News" },
    { id: "adminNotifications", icon: <Bell size={18} />, label: "Notifications" }
  ];

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white px-8 py-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#CC0000] mb-1">Dashboard</h1>
            <p className="text-gray-600">Welcome back, Administrator</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 bg-gray-100 px-4 py-2 rounded-lg">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Reservations</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{summaryData.reservations}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <CalendarIcon size={20} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">{summaryData.pendingReservations}</span> pending approval
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Registered Users</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{summaryData.users}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 text-green-600">
                <Users size={20} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">5</span> new this week
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Available Rooms</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{summaryData.rooms}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                <BookOpen size={20} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">3</span> currently occupied
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Unread Messages</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{summaryData.messages}</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
                <MessageSquare size={20} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Last reply <span className="font-medium text-gray-700">2 days</span> ago
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => setView(action.id)}
                    className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <div className="mr-3 p-2 rounded-lg bg-gray-100 text-gray-600">
                      {action.icon}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-700">{action.label}</p>
                      <ChevronRight size={16} className="text-gray-400 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent News */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Recent News</h2>
                <button
                  onClick={() => setShowNewsModal(true)}
                  className="flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <PlusCircle className="mr-2" size={16} /> Add News
                </button>
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
                    <div key={news._id} className="p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-800">{news.title}</h3>
                        <span className="text-xs text-gray-500">
                          {new Date(news.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {news.content}
                      </p>
                      <button className="text-blue-600 text-xs font-medium mt-2 hover:underline">
                        Read more
                      </button>
                    </div>
                  ))}
                  {newsList.length > 3 && (
                    <button 
                      onClick={() => setView("adminNews")}
                      className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mt-2"
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
            {/* Calendar */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Calendar</h2>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                className="border-0 w-full"
                tileClassName={({ date }) => {
                  const today = new Date();
                  if (
                    date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear()
                  ) {
                    return "bg-blue-600 text-white font-medium rounded-lg";
                  }
                  return null;
                }}
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start">
                    <div className="flex-shrink-0 mt-1 mr-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">
                        {activity.action}
                      </p>
                      <div className="flex justify-between">
                        <p className="text-xs text-gray-500">{activity.user}</p>
                        <p className="text-xs text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => setView("adminLogs")}
                  className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mt-2"
                >
                  View all activity logs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* News Modal */}
      {showNewsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Create News Post</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  placeholder="Enter news title"
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  placeholder="Write news content here..."
                  value={newsContent}
                  onChange={(e) => setNewsContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowNewsModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePostNews}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Publish News
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminDashboard;