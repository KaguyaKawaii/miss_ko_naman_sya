import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import AdminNavigation from "./AdminNavigation";
import { Plus, Trash2, Calendar, Users, MapPin, ChevronRight } from "lucide-react";
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
  const [showAddRoom, setShowAddRoom] = useState(false);
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

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/rooms");
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const res = await axios.get("http://localhost:5000/reservations");
      setReservations(res.data);
    } catch (err) {
      console.error("Fetch reservations error:", err);
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    if (!roomName || !location || !capacity || parseInt(capacity) <= 0) {
      alert("Please fill in all fields correctly.");
      return;
    }

    const formData = new FormData();
    formData.append("roomName", roomName);
    formData.append("location", location);
    formData.append("capacity", capacity);
    if (roomImage) formData.append("image", roomImage);

    try {
      await axios.post("http://localhost:5000/rooms", formData);
      fetchRooms();
      setRoomName("");
      setLocation("");
      setCapacity("");
      setRoomImage(null);
      setShowAddRoom(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRoom = async (id) => {
    if (window.confirm("Delete this room?")) {
      try {
        await axios.delete(`http://localhost:5000/rooms/${id}`);
        fetchRooms();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const formatPHDateTime = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      <AdminNavigation setView={setView} currentView="adminRoom" />
      <main
        ref={mainRef}
        tabIndex="-1"
        className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gray-50 outline-none"
      >
        <header className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#CC0000]">Room Management</h1>
              <p className="text-gray-600">View and manage all available rooms</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <StatCard title="Total Rooms" value={rooms.length} icon={<MapPin size={20} />} color="blue" />
            <StatCard title="Active Reservations" value={reservations.filter(r => r.status === "Approved").length} icon={<Calendar size={20} />} color="green" />
            <StatCard title="Pending Requests" value={reservations.filter(r => r.status === "Pending").length} icon={<Users size={20} />} color="yellow" />
            <StatCard title="Available Floors" value={4} icon={<MapPin size={20} />} color="purple" />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <RecentReservations reservations={reservations} setView={setView} formatDate={formatPHDateTime} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <FloorMapSection />
              <AllRoomsSection
                rooms={rooms}
                isLoading={isLoading}
                showAddRoom={showAddRoom}
                setShowAddRoom={setShowAddRoom}
                roomName={roomName}
                setRoomName={setRoomName}
                location={location}
                setLocation={setLocation}
                capacity={capacity}
                setCapacity={setCapacity}
                roomImage={roomImage}
                setRoomImage={setRoomImage}
                handleAddRoom={handleAddRoom}
                handleDeleteRoom={handleDeleteRoom}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600`}>{icon}</div>
      </div>
    </div>
  );
}

function RecentReservations({ reservations, setView, formatDate }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Recent Reservations</h2>
        <button
          onClick={() => setView("adminReservation")}
          className="text-blue-600 text-sm font-medium hover:underline"
        >
          View all
        </button>
      </div>
      {reservations.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No reservations yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reservations.slice(0, 4).map((r) => (
            <div key={r._id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-800 text-sm">{r.roomName}</h4>
                  <p className="text-xs text-gray-500">{r.location}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    r.status === "Approved"
                      ? "bg-green-100 text-green-800"
                      : r.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {r.status}
                </span>
              </div>
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <Calendar size={12} className="mr-1" />
                <span>{formatDate(r.datetime)}</span>
              </div>
              <p className="mt-1 text-xs text-gray-600 truncate">
                <span className="font-medium">By:</span> {r.userId?.name || "Unknown"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FloorMapSection() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Building Floors</h2>
        <button className="text-blue-600 text-sm font-medium hover:underline flex items-center">
          View all <ChevronRight size={16} className="ml-1" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {["Ground Floor", "2nd Floor", "4th Floor", "5th Floor"].map((floor) => (
          <div key={floor} className="relative group overflow-hidden rounded-lg h-32">
            <img
              src={floor === "5th Floor" ? Picture : GroundFloorImg}
              alt={floor}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-3">
              <h3 className="text-sm font-semibold text-white">{floor}</h3>
              <p className="text-xs text-white/80">
                {floor === "Ground Floor"
                  ? "6 rooms"
                  : floor === "2nd Floor"
                  ? "8 rooms"
                  : floor === "4th Floor"
                  ? "5 rooms"
                  : "4 rooms"}
              </p>
            </div>
            <button className="absolute bottom-2 right-2 px-3 py-1 bg-white/90 text-gray-800 rounded text-xs font-medium hover:bg-white transition-colors">
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AllRoomsSection({
  rooms,
  isLoading,
  showAddRoom,
  setShowAddRoom,
  roomName,
  setRoomName,
  location,
  setLocation,
  capacity,
  setCapacity,
  roomImage,
  setRoomImage,
  handleAddRoom,
  handleDeleteRoom,
}) {
  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">All Rooms</h2>
        <button
          onClick={() => setShowAddRoom(!showAddRoom)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus size={16} />
          {showAddRoom ? "Cancel" : "Add Room"}
        </button>
      </div>

      {showAddRoom && (
        <form onSubmit={handleAddRoom} className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="e.g. Conference Room A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="e.g. 2nd Floor"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="e.g. 20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Image</label>
            <input
              type="file"
              onChange={(e) => setRoomImage(e.target.files[0])}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Add Room
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading rooms...</div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No rooms added yet.</p>
          <button
            onClick={() => setShowAddRoom(true)}
            className="mt-2 text-blue-600 text-sm font-medium hover:underline"
          >
            Add your first room
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Room Name</th>
                <th className="px-4 py-2 text-left font-medium">Location</th>
                <th className="px-4 py-2 text-left font-medium">Capacity</th>
                <th className="px-4 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rooms.map((room) => (
                <tr key={room._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-sm">{room.roomName}</td>
                  <td className="px-4 py-2 text-sm">{room.location}</td>
                  <td className="px-4 py-2 text-sm flex items-center">
                    <Users size={14} className="mr-1 text-gray-400" />
                    {room.capacity}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleDeleteRoom(room._id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      title="Delete room"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminRooms;
