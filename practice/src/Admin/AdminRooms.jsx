import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import AdminNavigation from "./AdminNavigation";
import GroundFloorImg from "../assets/GroundFloor.jpg";
import Picture from "../assets/picture2.jpg";

function AdminRooms({ setView }) {
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [roomImage, setRoomImage] = useState(null);
  const mainRef = useRef(null);

  useEffect(() => {
    fetchRooms();
    fetchReservations();

    setTimeout(() => {
      if (mainRef.current) {
        mainRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        mainRef.current.focus({ preventScroll: true });
      }
    }, 100);
  }, []);

  const fetchRooms = () => {
    setIsLoading(true);
    axios
      .get("http://localhost:5000/rooms")
      .then((res) => setRooms(res.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  const fetchReservations = () => {
    axios
      .get("http://localhost:5000/reservations")
      .then((res) => {
        setReservations(res.data);
        console.log("Reservations fetched:", res.data);
      })
      .catch((err) => console.error("Fetch reservations error:", err));
  };

  const handleAddRoom = (e) => {
    e.preventDefault();
    if (!roomName || !location || !capacity) {
      alert("Please fill in all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("roomName", roomName);
    formData.append("location", location);
    formData.append("capacity", capacity);
    if (roomImage) formData.append("image", roomImage);

    axios
      .post("http://localhost:5000/rooms", formData)
      .then(() => {
        fetchRooms();
        setRoomName("");
        setLocation("");
        setCapacity("");
        setRoomImage(null);
      })
      .catch((err) => console.error(err));
  };

  const handleDeleteRoom = (id) => {
    if (window.confirm("Delete this room?")) {
      axios
        .delete(`http://localhost:5000/rooms/${id}`)
        .then(() => fetchRooms())
        .catch((err) => console.error(err));
    }
  };

  return (
    <div>
      <main
        ref={mainRef}
        tabIndex="-1"
        className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col outline-none"
      >
        <header className="bg-[#CC0000] text-white pl-5 h-[50px] flex items-center">
          <h1 className="text-2xl font-semibold">Room Management</h1>
        </header>

        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          {/* Room Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <div className="relative h-[200px] w-full rounded-xl overflow-hidden border border-gray-300">
              <img
                src={GroundFloorImg}
                alt="Ground Floor"
                className="w-full h-full object-cover object-[50%_40%]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-white/70" />
              <div className="absolute inset-y-0 top-6 right-4 flex items-center">
                <button className="px-6 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-red-700">
                  View
                </button>
              </div>
              <div className="absolute top-0 left-0 w-full h-7 bg-[#CC0000] flex items-center">
                <h2 className="pl-5 font-medium text-white">Ground Floor</h2>
              </div>
            </div>

            <div className="relative h-[200px] w-full rounded-xl overflow-hidden border border-gray-300">
              <img
                src={GroundFloorImg}
                alt="2nd Floor"
                className="w-full h-full object-cover object-[50%_40%]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-white/70" />
              <div className="absolute inset-y-0 top-6 right-4 flex items-center">
                <button className="px-6 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-red-700">
                  View
                </button>
              </div>
              <div className="absolute top-0 left-0 w-full h-7 bg-[#CC0000] flex items-center">
                <h2 className="pl-5 font-medium text-white">2nd Floor</h2>
              </div>
            </div>

            <div className="relative h-[200px] w-full rounded-xl overflow-hidden border border-gray-300">
              <img
                src={GroundFloorImg}
                alt="4th Floor"
                className="w-full h-full object-cover object-[50%_40%]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-white/70" />
              <div className="absolute inset-y-0 top-6 right-4 flex items-center">
                <button className="px-6 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-red-700">
                  View
                </button>
              </div>
              <div className="absolute top-0 left-0 w-full h-7 bg-[#CC0000] flex items-center">
                <h2 className="pl-5 font-medium text-white">4th Floor</h2>
              </div>
            </div>

            <div className="relative h-[200px] w-full rounded-xl overflow-hidden border border-gray-300">
              <img
                src={Picture}
                alt="5th Floor"
                className="w-full h-full object-cover object-[50%_40%]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-white/70" />
              <div className="absolute inset-y-0 top-6 right-4 flex items-center">
                <button className="px-6 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-red-700">
                  View
                </button>
              </div>
              <div className="absolute top-0 left-0 w-full h-7 bg-[#CC0000] flex items-center">
                <h2 className="pl-5 font-medium text-white">5th Floor</h2>
              </div>
            </div>
          </div>

          {/* Reservation List */}
          <div className="border border-gray-300 rounded-xl p-4 mt-8 bg-white">
            <h2 className="text-xl font-semibold mb-4">All Reservations</h2>
            {reservations.length === 0 ? (
              <p className="text-gray-500">No reservations yet.</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {reservations.map((r) => (
                  <div
                    key={r._id}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <p className="text-sm">
                      <span className="font-medium">Room:</span>{" "}
                      {r.roomName} at {r.location}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Reserved for:</span>{" "}
                      {new Date(r.datetime).toLocaleString("en-PH", {
                        timeZone: "Asia/Manila",
                      })}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Purpose:</span>{" "}
                      {r.purpose}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Status:</span>{" "}
                      <span
                        className={`font-semibold ${
                          r.status === "Approved"
                            ? "text-green-600"
                            : r.status === "Pending"
                            ? "text-yellow-600"
                            : r.status === "Rejected"
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {r.status}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminRooms;
