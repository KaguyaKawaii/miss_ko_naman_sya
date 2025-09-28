import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import AdminNavigation from "./AdminNavigation";
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Users, 
  MapPin, 
  ChevronRight, 
  Settings,
  Edit3,
  Eye,
  EyeOff,
  MessageSquare,
  Wifi,
  Snowflake,
  Monitor,
  Projector
} from "lucide-react";
import GroundFloorImg from "../assets/GroundFloor.jpg";
import Picture from "../assets/picture2.jpg";

function AdminRooms({ setView }) {
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [floor, setFloor] = useState("");
  const [roomType, setRoomType] = useState("General");
  const [capacity, setCapacity] = useState("");
  const [notes, setNotes] = useState("");
  const [roomImage, setRoomImage] = useState(null);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomFeatures, setRoomFeatures] = useState({
    wifi: false,
    aircon: false,
    projector: false,
    monitor: false
  });
  const mainRef = useRef(null);

  const roomTypes = ["General", "Lab", "Conference", "Lecture", "Meeting", "Special"];
  const floors = ["Ground Floor", "2nd Floor", "3rd Floor", "4th Floor", "5th Floor"];

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
    if (!roomName || !floor || !capacity || parseInt(capacity) <= 0) {
      alert("Please fill in all required fields correctly.");
      return;
    }

    const roomData = {
      room: roomName,
      floor: floor,
      type: roomType,
      capacity: parseInt(capacity),
      notes: notes,
      features: roomFeatures,
      isActive: true
    };

    try {
      await axios.post("http://localhost:5000/rooms", roomData);
      fetchRooms();
      resetForm();
      setShowAddRoom(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    if (!roomName || !floor || !capacity || parseInt(capacity) <= 0) {
      alert("Please fill in all required fields correctly.");
      return;
    }

    const roomData = {
      room: roomName,
      floor: floor,
      type: roomType,
      capacity: parseInt(capacity),
      notes: notes,
      features: roomFeatures,
      isActive: true
    };

    try {
      await axios.put(`http://localhost:5000/rooms/${editingRoom._id}`, roomData);
      fetchRooms();
      resetForm();
      setEditingRoom(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRoom = async (id) => {
    if (window.confirm("Are you sure you want to delete this room? This action cannot be undone.")) {
      try {
        await axios.delete(`http://localhost:5000/rooms/${id}`);
        fetchRooms();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleToggleRoomStatus = async (room) => {
    try {
      await axios.put(`http://localhost:5000/rooms/${room._id}`, {
        ...room,
        isActive: !room.isActive
      });
      fetchRooms();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setRoomName(room.room);
    setFloor(room.floor);
    setRoomType(room.type);
    setCapacity(room.capacity.toString());
    setNotes(room.notes || "");
    setRoomFeatures(room.features || {
      wifi: false,
      aircon: false,
      projector: false,
      monitor: false
    });
    setShowAddRoom(true);
  };

  const resetForm = () => {
    setRoomName("");
    setFloor("");
    setRoomType("General");
    setCapacity("");
    setNotes("");
    setRoomFeatures({
      wifi: false,
      aircon: false,
      projector: false,
      monitor: false
    });
    setRoomImage(null);
    setEditingRoom(null);
  };

  const cancelEdit = () => {
    resetForm();
    setShowAddRoom(false);
    setEditingRoom(null);
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

  const activeRoomsCount = rooms.filter(room => room.isActive).length;
  const inactiveRoomsCount = rooms.filter(room => !room.isActive).length;

  return (
    <>
      <AdminNavigation setView={setView} currentView="adminRoom" />
      <main
        ref={mainRef}
        tabIndex="-1"
        className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 outline-none"
      >
        <header className="bg-white/80 backdrop-blur-sm px-6 py-4 border-b border-gray-200/60 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#CC0000] bg-gradient-to-r from-[#CC0000] to-red-700 bg-clip-text ">
                Room Management
              </h1>
              <p className="text-gray-600 mt-1">Manage rooms, availability, and configurations</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 bg-white/80 px-3 py-1 rounded-full border border-gray-200/60">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <StatCard 
              title="Total Rooms" 
              value={rooms.length} 
              icon={<MapPin size={20} />} 
              color="blue" 
            />
            <StatCard 
              title="Active Rooms" 
              value={activeRoomsCount} 
              icon={<Eye size={20} />} 
              color="green" 
            />
            <StatCard 
              title="Inactive Rooms" 
              value={inactiveRoomsCount} 
              icon={<EyeOff size={20} />} 
              color="orange" 
            />
            <StatCard 
              title="Available Floors" 
              value={floors.length} 
              icon={<MapPin size={20} />} 
              color="purple" 
            />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <RecentReservations reservations={reservations} setView={setView} formatDate={formatPHDateTime} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <FloorMapSection floors={floors} />
              <AllRoomsSection
                rooms={rooms}
                isLoading={isLoading}
                showAddRoom={showAddRoom}
                setShowAddRoom={setShowAddRoom}
                roomName={roomName}
                setRoomName={setRoomName}
                floor={floor}
                setFloor={setFloor}
                roomType={roomType}
                setRoomType={setRoomType}
                capacity={capacity}
                setCapacity={setCapacity}
                notes={notes}
                setNotes={setNotes}
                roomFeatures={roomFeatures}
                setRoomFeatures={setRoomFeatures}
                roomImage={roomImage}
                setRoomImage={setRoomImage}
                handleAddRoom={handleAddRoom}
                handleUpdateRoom={handleUpdateRoom}
                handleDeleteRoom={handleDeleteRoom}
                handleToggleRoomStatus={handleToggleRoomStatus}
                handleEditRoom={handleEditRoom}
                editingRoom={editingRoom}
                cancelEdit={cancelEdit}
                roomTypes={roomTypes}
                floors={floors}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600"
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function RecentReservations({ reservations, setView, formatDate }) {
  const recentReservations = reservations
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
    .slice(0, 4);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Recent Reservations</h2>
        <button
          onClick={() => setView("adminReservation")}
          className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1 hover:gap-2 transition-all"
        >
          View all <ChevronRight size={16} />
        </button>
      </div>
      {recentReservations.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-gray-500">No reservations yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentReservations.map((r) => (
            <div 
              key={r._id} 
              className="bg-white border border-gray-200/80 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:border-blue-200/60"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">{r.roomName}</h4>
                  <p className="text-xs text-gray-500 mt-1">{r.location}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    r.status === "Approved"
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : r.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}
                >
                  {r.status}
                </span>
              </div>
              <div className="flex items-center text-xs text-gray-500 mb-2">
                <Calendar size={12} className="mr-2" />
                <span>{formatDate(r.datetime)}</span>
              </div>
              <p className="text-xs text-gray-600 truncate">
                <span className="font-medium">By:</span> {r.userId?.name || "Unknown"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FloorMapSection({ floors }) {
  const floorData = [
    { name: "Ground Floor", rooms: 6, image: GroundFloorImg },
    { name: "2nd Floor", rooms: 8, image: GroundFloorImg },
    { name: "3rd Floor", rooms: 7, image: Picture },
    { name: "4th Floor", rooms: 5, image: Picture },
    { name: "5th Floor", rooms: 4, image: Picture }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Building Floors</h2>
        <button className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1 hover:gap-2 transition-all">
          View all <ChevronRight size={16} />
        </button>
      </div>

      <div className="space-y-4">
        {floorData.map((floor, index) => (
          <div 
            key={floor.name} 
            className="relative group overflow-hidden rounded-xl h-24 transition-all duration-300 hover:shadow-md"
          >
            <img
              src={floor.image}
              alt={floor.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
            <div className="absolute inset-0 p-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{floor.name}</h3>
                <p className="text-sm text-white/80">
                  {floor.rooms} room{floor.rooms !== 1 ? 's' : ''}
                </p>
              </div>
              <button className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors border border-white/30">
                Explore
              </button>
            </div>
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
  floor,
  setFloor,
  roomType,
  setRoomType,
  capacity,
  setCapacity,
  notes,
  setNotes,
  roomFeatures,
  setRoomFeatures,
  roomImage,
  setRoomImage,
  handleAddRoom,
  handleUpdateRoom,
  handleDeleteRoom,
  handleToggleRoomStatus,
  handleEditRoom,
  editingRoom,
  cancelEdit,
  roomTypes,
  floors
}) {
  const toggleFeature = (feature) => {
    setRoomFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  const FeatureIcon = ({ feature, enabled }) => {
    const icons = {
      wifi: <Wifi size={14} />,
      aircon: <Snowflake size={14} />,
      projector: <Projector size={14} />,
      monitor: <Monitor size={14} />
    };

    const colors = {
      wifi: enabled ? "text-blue-600 bg-blue-100" : "text-gray-400 bg-gray-100",
      aircon: enabled ? "text-green-600 bg-green-100" : "text-gray-400 bg-gray-100",
      projector: enabled ? "text-purple-600 bg-purple-100" : "text-gray-400 bg-gray-100",
      monitor: enabled ? "text-orange-600 bg-orange-100" : "text-gray-400 bg-gray-100"
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${colors[feature]}`}>
        {icons[feature]}
        {feature}
      </span>
    );
  };

  return (
    <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">All Rooms</h2>
          <p className="text-sm text-gray-500 mt-1">Manage room configurations and availability</p>
        </div>
        <button
          onClick={() => {
            if (editingRoom) cancelEdit();
            setShowAddRoom(!showAddRoom);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-sm hover:shadow-md text-sm font-medium"
        >
          <Plus size={16} />
          {showAddRoom ? "Cancel" : editingRoom ? "Editing Room" : "Add Room"}
        </button>
      </div>

      {(showAddRoom || editingRoom) && (
        <form 
          onSubmit={editingRoom ? handleUpdateRoom : handleAddRoom} 
          className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-gradient-to-br from-blue-50/50 to-gray-50/50 rounded-2xl border border-blue-200/40 shadow-sm"
        >
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingRoom ? `Edit ${editingRoom.room}` : "Add New Room"}
            </h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Name *</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g. Conference Room A"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Floor *</label>
            <select
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Select Floor</option>
              {floors.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {roomTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Capacity *</label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g. 20"
              min="1"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Features</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(roomFeatures).map(feature => (
                <button
                  key={feature}
                  type="button"
                  onClick={() => toggleFeature(feature)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    roomFeatures[feature] 
                      ? "bg-blue-50 border-blue-200 text-blue-700" 
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <FeatureIcon feature={feature} enabled={roomFeatures[feature]} />
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare size={14} className="inline mr-2" />
              Notes & Remarks
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g. Under maintenance, No aircon, Special equipment available..."
              rows="3"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={cancelEdit}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md text-sm font-medium"
            >
              {editingRoom ? "Update Room" : "Add Room"}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-3">Loading rooms...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl border-2 border-dashed border-gray-300">
          <MapPin className="mx-auto text-gray-400 mb-3" size={48} />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No rooms added yet</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first room</p>
          <button
            onClick={() => setShowAddRoom(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md text-sm font-medium"
          >
            <Plus size={16} className="inline mr-2" />
            Add Your First Room
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div 
              key={room._id} 
              className={`bg-white border rounded-2xl p-4 transition-all duration-300 hover:shadow-md ${
                room.isActive 
                  ? "border-green-200/60 hover:border-green-300/60" 
                  : "border-red-200/60 hover:border-red-300/60 opacity-80"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800 text-sm">{room.room}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      room.isActive 
                        ? "bg-green-100 text-green-800 border border-green-200" 
                        : "bg-red-100 text-red-800 border border-red-200"
                    }`}>
                      {room.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{room.floor} • {room.type}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditRoom(room)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit room"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(room._id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete room"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center text-xs text-gray-500">
                  <Users size={12} className="mr-1" />
                  Capacity: {room.capacity}
                </div>
                <button
                  onClick={() => handleToggleRoomStatus(room)}
                  className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                    room.isActive
                      ? "bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700"
                      : "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700"
                  }`}
                >
                  {room.isActive ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
              </div>

              {room.features && Object.values(room.features).some(val => val) && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {Object.entries(room.features).map(([feature, enabled]) => 
                    enabled && <FeatureIcon key={feature} feature={feature} enabled={enabled} />
                  )}
                </div>
              )}

              {room.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mt-2">
                  <p className="text-xs text-yellow-800 flex items-start gap-1">
                    <MessageSquare size={12} className="mt-0.5 flex-shrink-0" />
                    <span>{room.notes}</span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminRooms;