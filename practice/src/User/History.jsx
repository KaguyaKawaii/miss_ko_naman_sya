import { useEffect, useState } from "react";
import axios from "axios";

function History({ user }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user._id) return;

    const fetchReservations = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/reservations/user/${user._id}`
        );
        setReservations(res.data);
      } catch (error) {
        console.error("Failed to fetch reservations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [user]);

  const formatPH = (d) =>
    new Date(d).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const statusBadge = (status) => {
    const color =
      status === "Approved"
        ? "bg-green-100 text-green-700"
        : status === "Pending"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700";
    return (
      <span
        className={`px-3 py-0.5 rounded-full text-xs font-semibold ${color}`}
      >
        {status}
      </span>
    );
  };

  const SkeletonLoader = () => (
    <div className="animate-pulse space-y-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex gap-4 items-start border-b border-gray-100 pb-6"
        >
          <div className="mt-1.5">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>

          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-300 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/5"></div>
            <div className="h-4 bg-gray-200 rounded w-3/5"></div>
            <div className="flex gap-2 mt-2">
              <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
              <div className="h-4 w-28 bg-gray-200 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 rounded ml-auto"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#CC0000] text-white px-6 h-[50px] flex items-center shadow-md">
        <h1 className="text-2xl font-bold">Reservation History</h1>
      </header>

      <div className="m-5 border border-gray-200 rounded-lg p-6 bg-white shadow-md overflow-y-auto space-y-6">
        {loading ? (
          <SkeletonLoader />
        ) : reservations.length === 0 ? (
          <p className="text-gray-600">No reservation records found.</p>
        ) : (
          <div className="space-y-6">
            {reservations.map((res, index) => (
              <div
                key={res._id || index}
                className="flex gap-4 items-start border-b border-gray-100 pb-6"
              >
                <div className="mt-1.5">
                  <div className="w-3 h-3 bg-[#CC0000] rounded-full"></div>
                </div>

                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-800">
                    {res.roomName}
                  </h2>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Location:</span>{" "}
                    {res.location}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Schedule:</span>{" "}
                    {formatPH(res.datetime)}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Purpose:</span>{" "}
                    {res.purpose}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3 items-center">
                    {statusBadge(res.status)}
                    <p className="text-xs text-gray-500 italic">
                      Reserved on:{" "}
                      {new Date(res.createdAt).toLocaleDateString("en-PH", {
                        timeZone: "Asia/Manila",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <button
                      onClick={() =>
                        alert("Detailed view not yet implemented")
                      }
                      className="text-[#CC0000] text-sm font-medium hover:underline ml-auto"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default History;
