import { useEffect, useState } from "react";
import axios from "axios";



function StaffNotification({ setView, setSelectedReservation }) {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/reservations")
      .then((res) => {
        const sorted = res.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setReservations(sorted);
      })
      .catch((err) => {
        console.error("Failed to fetch reservations:", err);
      });
  }, []);

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

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#CC0000] text-white pl-5 h-[50px] flex items-center justify-start">
        <h1 className="text-2xl font-semibold">Reservation Notifications</h1>
      </header>

      

      <div className="m-5 border border-gray-200 rounded-lg p-6 bg-white shadow-md overflow-y-auto">
        {reservations.length === 0 ? (
          <p>No reservations found.</p>
        ) : (
          reservations.map((res) => (
            <div
              key={res._id}
              className="border border-gray-200 rounded-2xl shadow-sm w-full h-fit p-4 mb-4 bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col text-sm">
                  <p className="mb-1">
                    <strong>Date:</strong> {formatDateTime(res.datetime)}
                  </p>
                  <p className="mb-1">
                    <strong>{res.userId?.name || "Unknown User"}</strong> reserved{" "}
                    <strong>{res.roomName}</strong> at <strong>{res.location}</strong>. Status:{" "}
                    <span
                      className={`font-bold ${
                        res.status === "Approved"
                          ? "text-green-600"
                          : res.status === "Pending"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {res.status}
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedReservation(res);
                    setView("reservationDetails");
                  }}
                  className="text-[#CC0000] font-semibold hover:underline"
                >
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}

export default StaffNotification;
