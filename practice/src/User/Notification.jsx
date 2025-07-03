import { useEffect, useState } from "react";
import axios from "axios";
import { Clock, CheckCircle } from "lucide-react";
import socket from "../utils/socket";

function Notification({ user, setView, setSelectedReservation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      fetchNotifications();

      const handleNewNotification = (newNotif) => {
        if (newNotif.userId === user._id) {
          fetchNotifications();
        }
      };

      socket.on("notification", handleNewNotification);

      return () => {
        socket.off("notification", handleNewNotification);
      };
    }
  }, [user]);

  const fetchNotifications = () => {
    setLoading(true);
    axios
      .get(`http://localhost:5000/notifications/user/${user._id}`)
      .then((res) => {
        const sorted = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotifications(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch notifications:", err);
        setLoading(false);
      });
  };

  const markAsRead = (id) => {
    axios
      .put(`http://localhost:5000/notifications/${id}/read`)
      .then(() => fetchNotifications())
      .catch((err) => console.error("Failed to mark as read:", err));
  };

  const formatDateTime = (date) =>
    new Date(date).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const statusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      case "Expired":
        return "bg-gray-200 text-gray-800";
      case "Ongoing":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (loading) {
    return (
      <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">
        <header className="bg-[#CC0000] text-white px-6 h-[50px] flex items-center shadow-md">
        <h1 className="text-2xl font-bold">Notification</h1>
      </header>

        <div
          className="m-5 border border-gray-200 rounded-lg p-6 bg-white shadow-md overflow-y-auto space-y-4"
          style={{ height: "calc(100vh - 50px - 40px)" }}
        >
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-2xl p-4 bg-gray-50 flex justify-between items-start"
              >
                <div className="space-y-2 w-full">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                  <div className="flex gap-2 mt-2">
                    <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">
      <header className="bg-[#CC0000] text-white px-6 h-[50px] flex items-center shadow-md">
        <h1 className="text-2xl font-bold">Notification</h1>
      </header>

      <div
        className="m-5 border border-gray-200 rounded-lg p-6 bg-white shadow-md overflow-y-auto"
        style={{ height: "calc(100vh - 50px - 40px)" }}
      >
        {notifications.length === 0 ? (
          <p className="text-gray-600">No notifications yet.</p>
        ) : (
          <ul className="space-y-4">
            {notifications.map((notif) => (
              <li
                key={notif._id}
                className={`border border-gray-200 rounded-2xl shadow-sm p-4 transition ${
                  notif.isRead ? "bg-gray-50" : "bg-blue-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-800 mb-1">
                      <span className="font-semibold">Dear {user?.name},</span>{" "}
                      {notif.message}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 gap-1 mb-2">
                      <Clock size={14} />
                      {formatDateTime(notif.createdAt)}
                    </div>
                    <span
                      className={`inline-block text-xs px-2 py-1 rounded-full font-semibold ${statusColor(
                        notif.status
                      )}`}
                    >
                      {notif.status}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 items-end">
                    {notif.reservationId && (
                      <button
                        onClick={() => {
                          setSelectedReservation(notif.reservationId);
                          setView("reservationDetails");
                          markAsRead(notif._id);
                        }}
                        className="text-[#CC0000] font-medium text-sm hover:underline cursor-pointer"
                      >
                        View
                      </button>
                    )}

                    {!notif.isRead && (
                      <button
                        onClick={() => markAsRead(notif._id)}
                        className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
                      >
                        <CheckCircle size={14} /> Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

export default Notification;
