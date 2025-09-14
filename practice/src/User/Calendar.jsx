import React, { useEffect, useState } from "react";
import moment from "moment-timezone";
import CalendarModal from "./Modals/CalendarModal"; // ✅ import modal

function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [roomStatuses, setRoomStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false); // ✅ modal state

  const formatTime = (iso) => {
    return moment(iso).tz("Asia/Manila").format("hh:mm A");
  };

  const fetchAvailability = async () => {
    setLoading(true);
    setError(null);

    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const res = await fetch(
        `http://localhost:5000/reservations/availability?date=${dateStr}`
      );

      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();

      if (!Array.isArray(data)) throw new Error("Invalid availability format");

      setRoomStatuses(data);
    } catch (err) {
      console.error("Error fetching availability:", err);
      setError("Failed to load room availability");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [selectedDate]);

  const groupedByFloor = roomStatuses.reduce((acc, room) => {
    const floor = room.floor || "Unknown Floor";
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {});

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col bg-gray-50 text-gray-800">
      <header className=" text-black px-6 h-[60px] flex items-center justify-between shadow-sm">
  <h1 className="text-xl md:text-2xl font-bold tracking-wide">Calendar</h1>
</header>


      <div className="p-8 flex-1 overflow-y-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Room Availability</h2>
            <p className="text-gray-600 font-medium mt-1">
              {selectedDate.toLocaleDateString("en-PH", {
                timeZone: "Asia/Manila",
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </p>
          </div>

          {/* ✅ Replaced input with a button that opens modal */}
          <div>
            <button
              onClick={() => setShowModal(true)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC0000] shadow-sm bg-white hover:bg-gray-50"
            >
              Pick Date
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-[#CC0000] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading room availability...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6 shadow-sm">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        ) : (
          ["Ground Floor", "2nd Floor", "4th Floor", "5th Floor"]
            .filter((f) => groupedByFloor[f])
            .map((floorName, fIdx) => {
              const rooms = groupedByFloor[floorName];
              return (
                <div
                  key={fIdx}
                  className="bg-white rounded-xl shadow-sm overflow-hidden mb-8 border border-gray-200 transition-all hover:shadow-md"
                >
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800 text-lg">{floorName}</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {rooms.map((room, rIdx) => {
                      const isOccupied =
                        Array.isArray(room.occupied) && room.occupied.length > 0;

                      return (
                        <div
                          key={rIdx}
                          className={`p-5 flex justify-between items-center transition-colors duration-200 ${
                            isOccupied ? "hover:bg-red-50" : "hover:bg-green-50"
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-3 h-3 rounded-full mr-3 ${
                                isOccupied ? "bg-red-500" : "bg-green-500"
                              }`}
                            ></div>
                            <p className="font-medium text-gray-800">
                              {room.room || "Unnamed Room"}
                            </p>
                          </div>
                          <div className="text-right">
                            {isOccupied ? (
                              <div className="space-y-2">
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 uppercase tracking-wide">
                                  Occupied
                                </span>
                                <div className="text-sm text-gray-600 mt-1 space-y-1">
                                  {room.occupied.map((o, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center justify-end"
                                    >
                                      <span className="font-mono mr-2 bg-gray-100 px-2 py-1 rounded">
                                        {formatTime(o.start)} – {formatTime(o.end)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 uppercase tracking-wide">
                                Available
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* ✅ Calendar Modal */}
      {showModal && (
        <CalendarModal
          selectedDate={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          onClose={() => setShowModal(false)}
        />
      )}
    </main>
  );
}

export default Calendar;
