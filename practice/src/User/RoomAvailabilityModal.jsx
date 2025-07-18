import React from "react";
import moment from "moment-timezone";

function RoomAvailabilityModal({
  selectedDate,
  roomStatuses = [],
  availLoading,
  availError,
  onClose,
}) {
  const formatTime = (iso) => {
    return moment(iso).tz("Asia/Manila").format("hh:mm A");
  };

  const groupedByFloor = roomStatuses.reduce((acc, room) => {
    const floor = room.floor || "Unknown Floor";
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl"> {/* Changed from max-w-3xl to max-w-4xl */}
        <div className="p-6 flex justify-between items-center border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Room Availability
            </h2>
            <p className="text-indigo-600 font-medium mt-1">
              {selectedDate.toLocaleDateString("en-PH", {
                timeZone: "Asia/Manila",
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </p>
          </div>
          <button
            className="text-gray-500 hover:text-red-500 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {availLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 text-lg">Loading room availability...</p>
            </div>
          ) : availError ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700 font-medium">{availError}</p>
            </div>
          ) : (
["Ground Floor", "2nd Floor", "4th Floor", "5th Floor"].filter(f => groupedByFloor[f]).map((floorName, fIdx) => {
  const rooms = groupedByFloor[floorName];
  return (
    <div
      key={fIdx}
      className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100"
    >
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
        <h3 className="font-bold text-gray-700 text-lg">{floorName}</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {rooms.map((room, rIdx) => {
          const isOccupied =
            Array.isArray(room.occupied) && room.occupied.length > 0;

          return (
            <div
              key={rIdx}
              className={`p-4 flex justify-between items-center transition-colors duration-150 ${
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
                  <div className="space-y-1">
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                      Occupied
                    </span>
                    <div className="text-sm text-gray-600 mt-1 space-y-1">
                      {room.occupied.map((o, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-end"
                        >
                          <span className="mr-2">
                            {formatTime(o.start)} – {formatTime(o.end)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
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
      </div>
    </div>
  );
}

export default RoomAvailabilityModal;