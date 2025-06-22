import React from "react";
import GroundFloorImg from "../assets/GroundFloor.jpg";

function ReservationDetails({ reservation, setView }) {
  if (!reservation) {
    return (
      <div className="ml-[250px] p-8">
        <h1 className="text-2xl font-semibold">No reservation selected.</h1>
      </div>
    );
  }

  const formatDate = (datetime) =>
    new Date(datetime).toLocaleDateString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (datetime) =>
    new Date(datetime).toLocaleTimeString("en-PH", {
      timeZone: "Asia/Manila",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const locationImages = {
    "Ground Floor": GroundFloorImg,
  };

  const statusBadge = (status) => {
    const color =
      status === "Approved"
        ? "bg-green-100 text-green-700"
        : status === "Rejected"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700";

    return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
        {status}
      </span>
    );
  };

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] bg-white min-h-screen flex flex-col">
      <header className="bg-[#CC0000] text-white pl-5 h-[50px] flex items-center">
        <h1 className="text-2xl font-semibold">Reservation Details</h1>
      </header>

      <div className="p-8 flex flex-col gap-10">

        {/* Reservation Summary */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600 font-medium">Date</p>
            <div className="border border-gray-200 p-3 rounded-lg bg-gray-50">
              {formatDate(reservation.datetime)}
            </div>
          </div>

          <div>
            <p className="text-gray-600 font-medium">Time</p>
            <div className="border border-gray-200 p-3 rounded-lg bg-gray-50">
              {formatTime(reservation.datetime)}
            </div>
          </div>

          <div>
            <p className="text-gray-600 font-medium">Room Location</p>
            <div className="border border-gray-200 p-3 rounded-lg bg-gray-50">
              {reservation.location}
            </div>
          </div>

          <div>
            <p className="text-gray-600 font-medium">Room Name</p>
            <div className="border border-gray-200 p-3 rounded-lg bg-gray-50">
              {reservation.roomName}
            </div>
          </div>

          <div className="col-span-2">
            <p className="text-gray-600 font-medium">Purpose</p>
            <div className="border border-gray-200 p-3 rounded-lg bg-gray-50">
              {reservation.purpose}
            </div>
          </div>

          <div className="col-span-2">
            <p className="text-gray-600 font-medium mb-1">Status</p>
            {statusBadge(reservation.status)}
          </div>
        </div>

        {/* Room Location Image */}
        {locationImages[reservation.location] && (
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-3">Room Location Preview</h2>
            <div className="border rounded-2xl overflow-hidden w-[500px] h-[300px] shadow-lg">
              <img
                src={locationImages[reservation.location]}
                alt={reservation.location}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="mt-3 text-gray-600 font-medium">{reservation.location}</p>
          </div>
        )}

        {/* Participants Table */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Participants</h2>
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full">
              <thead className="bg-[#FFCC00] text-black">
                <tr>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Course & Year</th>
                  <th className="py-3 px-4 text-left">Department</th>
                  <th className="py-3 px-4 text-left">ID Number</th>
                </tr>
              </thead>
              <tbody>
                {reservation.participants.map((p, i) => (
                  <tr
                    key={i}
                    className={`${
                      i % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="py-3 px-4">{p.name}</td>
                    <td className="py-3 px-4">{p.courseYear}</td>
                    <td className="py-3 px-4">{p.department}</td>
                    <td className="py-3 px-4">{p.idNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col mt-5">
          <h2 className="font-semibold mb-2">
            <span className="text-red-600">*</span> Notes
          </h2>
          <ul className="list-disc pl-5 text-[15px] text-gray-700 space-y-1">
            <li>Group will be notified 15 minutes before session ends. Extensions allowed if no conflict follows.</li>
            <li>LRC may cancel reservations if the group doesn’t arrive within 15 minutes.</li>
          </ul>
        </div>

        {/* Back Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setView("list")}
            className="bg-[#CC0000] text-white px-5 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Back to List
          </button>
        </div>
      </div>
    </main>
  );
}

export default ReservationDetails;
