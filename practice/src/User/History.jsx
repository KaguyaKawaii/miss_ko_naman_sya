import { useEffect, useState } from "react";
import axios from "axios";

function History({ user }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user._id) return;

    const fetchReservations = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/reservations/user/${user._id}`);
        setReservations(res.data);
      } catch (error) {
        console.error("Failed to fetch reservations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [user]);

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#CC0000] text-white pl-5 h-[50px] flex items-center justify-start">
        <h1 className="text-2xl font-semibold">Reservation History</h1>
      </header>

      <div className="m-5 border border-gray-200 rounded-lg p-6 bg-white shadow-md overflow-y-auto">
        {loading ? (
          <p>Loading reservations...</p>
        ) : reservations.length === 0 ? (
          <p>No reservations found.</p>
        ) : (
          reservations.map((res, index) => (
            <div
              key={res._id || index}
              className="border border-gray-200 rounded-2xl shadow-sm w-full h-fit mb-4"
            >
              <div className="flex items-center justify-start pl-5 py-4">
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col items-start justify-center">
                    <p className="font-semibold text-gray-700">
                      Date: {new Date(res.datetime).toLocaleDateString()}
                    </p>
                    <p>Room: {res.roomName}</p>
                    <p>Location: {res.location}</p>
                    <p>
                      Time:{" "}
                      {new Date(res.datetime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    
                  </div>

                  <div className="m-6">
                    <button
                      className="text-[#CC0000] font-semibold hover:underline"
                      onClick={() => alert("Detailed view not yet implemented")}
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}

export default History;
