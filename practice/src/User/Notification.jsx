import { useEffect, useState } from "react";
import axios from "axios";
import { Clock, CheckCircle } from "lucide-react";

function Notification({ user, setView, setSelectedReservation }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let interval;
    if (user?._id) {
      fetchNotifications();
      interval = setInterval(() => {
        fetchNotifications();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = () => {
    axios
      .get(`http://localhost:5000/notifications/user/${user._id}`)
      .then((res) => {
        const sorted = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotifications(sorted);
      })
      .catch((err) => console.error("Failed to fetch notifications:", err));
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

  const formatDateOnly = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const statusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Pending":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">
      <header className="bg-[#CC0000] text-white pl-5 h-[50px] min-h-[50px] flex-shrink-0 flex items-center">
        <h1 className="text-2xl font-semibold">Notification</h1>
      </header>

      <div className="m-5 border border-gray-200 rounded-lg p-6 bg-white shadow-md overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-gray-600">No notifications yet.</p>
        ) : (
          <ul className="space-y-4">
            {notifications.map((notif) => (
              <li
                key={notif._id}
                className={`border border-gray-200 rounded-2xl shadow-sm w-full p-4 transition ${
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
                        className="text-[#CC0000] font-medium text-sm hover:underline"
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
