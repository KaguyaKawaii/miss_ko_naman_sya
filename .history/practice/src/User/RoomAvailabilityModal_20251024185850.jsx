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

  // Filter out inactive rooms and group by floor
  const groupedByFloor = roomStatuses
    .filter(room => room.isActive !== false) // Only show active rooms
    .reduce((acc, room) => {
      const floor = room.floor || "Unknown Floor";
      if (!acc[floor]) acc[floor] = [];
      acc[floor].push(room);
      return acc;
    }, {});

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Room Availability
            </h2>
            <p className="text-gray-500 font-medium mt-1">
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
            className="text-gray-500 hover:text-red-500 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100 cursor-pointer"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {availLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 text-lg">Loading room availability...</p>
            </div>
          ) : availError ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
              <p className="text-red-700 font-medium">{availError}</p>
            </div>
          ) : roomStatuses.filter(room => room.isActive !== false).length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No rooms available</h3>
              <p className="text-gray-500">There are no active rooms to display for the selected date.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {["Ground Floor", "2nd Floor", "4th Floor", "5th Floor"].filter(f => groupedByFloor[f]).map((floorName, fIdx) => {
                const rooms = groupedByFloor[floorName];
                return (
                  <div
                    key={fIdx}
                    className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
                  >
                    <div className="px-5 py-3.5 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <h3 className="font-bold text-gray-800 text-lg">{floorName}</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {rooms.map((room, rIdx) => {
                        const isOccupied =
                          Array.isArray(room.occupied) && room.occupied.length > 0;

                        return (
                          <div
                            key={rIdx}
                            className={`p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 transition-colors duration-150 ${
                              isOccupied ? "hover:bg-red-50" : "hover:bg-green-50"
                            }`}
                          >
                            <div className="flex items-center">
                              <div
                                className={`w-3 h-3 rounded-full mr-3 flex-shrink-0 ${
                                  isOccupied ? "bg-red-500" : "bg-green-500"
                                }`}
                              ></div>
                              <p className="font-semibold text-gray-900 text-base">
                                {room.room || "Unnamed Room"}
                              </p>
                            </div>
                            <div className="sm:text-right">
                              {isOccupied ? (
                                <div className="space-y-2">
                                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                    Occupied Schedule
                                  </span>
                                  <div className="text-sm text-gray-700 space-y-1.5 mt-2">
                                    {room.occupied.map((o, i) => (
                                      <div
                                        key={i}
                                        className="flex flex-wrap justify-end items-center gap-2"
                                      >
                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                                          {formatTime(o.start)} – {formatTime(o.end)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <span className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                  Available All Day
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoomAvailabilityModal;