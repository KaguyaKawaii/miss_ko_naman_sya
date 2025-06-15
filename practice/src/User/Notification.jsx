import { useEffect, useState } from "react";
import axios from "axios";

function Notification({ user, setView, setSelectedReservation }) {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    if (user?._id) {
      axios
        .get(`http://localhost:5000/reservations/user/${user._id}`)
        .then((res) => {
          setReservations(res.data);
        })
        .catch((err) => {
          console.error("Failed to fetch reservations:", err);
        });
    }
  }, [user]);

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#CC0000] text-white pl-5 h-[50px] flex items-center justify-start">
        <h1 className="text-2xl font-semibold">Notification</h1>
      </header>

      <div className="m-5 border border-gray-200 rounded-lg p-6 bg-white shadow-md overflow-y-auto">
        {reservations.length === 0 ? (
          <p>No reservations yet.</p>
        ) : (
          reservations.map((res) => (
            <div
              key={res._id}
              className="border border-gray-200 rounded-2xl shadow-sm w-full h-fit p-4 mb-4 bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col text-sm">
                  <p className="mb-1">
                    <strong>Date:</strong>{" "}
                    {new Date(res.datetime).toLocaleString()}
                  </p>
                  <p className="mb-1">
                    <strong>Dear {user?.name},</strong> your reservation for{" "}
                    <strong>{res.roomName}</strong> at{" "}
                    <strong>{res.location}</strong> is{" "}
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
                    .
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedReservation(res);
                    setView('reservationDetails');
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

export default Notification;
