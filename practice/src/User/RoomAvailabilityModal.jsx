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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl overflow-hidden shadow-lg">
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-semibold">
            Room Availability —{" "}
            {selectedDate.toLocaleDateString("en-PH", {
              timeZone: "Asia/Manila",
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </h2>
          <button
            className="text-gray-600 hover:text-red-600 font-bold text-lg"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <div className="p-4 max-h-[800px] overflow-y-auto">
          {availLoading ? (
            <p className="text-center text-gray-600">Loading room availability…</p>
          ) : availError ? (
            <p className="text-center text-red-600">{availError}</p>
          ) : (
            Object.entries(groupedByFloor).map(([floorName, rooms], fIdx) => (
              <div
                key={fIdx}
                className="border m-1 p-5 rounded-2xl border-gray-200 shadow-sm mt-5"
              >
                <h1 className="font-semibold mb-2">{floorName}</h1>
                <div className="border border-gray-200 w-full mb-2"></div>

                {rooms.map((room, rIdx) => {
                  const isOccupied =
                    Array.isArray(room.occupied) && room.occupied.length > 0;

                  return (
                    <div
                      key={rIdx}
                      className={`border rounded-lg p-2 flex justify-between mt-2 ${
                        isOccupied
                          ? "border-red-300 bg-red-50"
                          : "border-green-300 bg-green-50"
                      }`}
                    >
                      <p className="font-medium">{room.room || "Unnamed Room"}</p>
                      <div className="text-right">
                        {isOccupied ? (
                          <div className="text-red-600 text-sm">
                            <p className="font-semibold">Occupied</p>
                            {room.occupied.map((o, i) => (
                              <p key={i}>
                                {formatTime(o.start)} – {formatTime(o.end)} ({o.status})
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-green-700 font-semibold">Available</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default RoomAvailabilityModal;
