import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import AdminNavigation from "./AdminNavigation";

function AdminRooms({ setView }) {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [roomImage, setRoomImage] = useState(null);
  const mainRef = useRef(null); // 👈 Add ref for focus/scroll

  useEffect(() => {
    fetchRooms();

    // Focus and scroll to the main section when component mounts
    setTimeout(() => {
      if (mainRef.current) {
        mainRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        mainRef.current.focus({ preventScroll: true }); // Optional: Only if needed
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
          {/* Room List */}
          <div className="border border-gray-300 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#CC0000] text-white">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Room</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Capacity</th>
                  <th className="p-3">Image</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center p-4">
                      Loading…
                    </td>
                  </tr>
                ) : rooms.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-4">
                      No rooms found.
                    </td>
                  </tr>
                ) : (
                  rooms.map((room, index) => (
                    <tr
                      key={room._id}
                      className="border-b hover:bg-gray-50 duration-150"
                    >
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">{room.roomName}</td>
                      <td className="p-3">{room.location}</td>
                      <td className="p-3">{room.capacity}</td>
                      <td className="p-3">
                        {room.imageUrl ? (
                          <img
                            src={room.imageUrl}
                            alt="Room"
                            className="w-20 h-12 object-cover rounded"
                          />
                        ) : (
                          <span className="text-gray-500">No Image</span>
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteRoom(room._id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminRooms;
