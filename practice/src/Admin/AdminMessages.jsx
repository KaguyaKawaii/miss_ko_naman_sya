import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import AdminNavigation from "./AdminNavigation";
import { 
  MessageSquare, 
  ChevronDown, 
  Search, 
  X, 
  User, 
  Users, 
  Home, 
  Send,
  Clock
} from "lucide-react";

const socket = io("http://localhost:5000");

function AdminMessages({ setView }) {
  const [messages, setMessages] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [selectedId, setSelectedId] = useState("Ground Floor");
  const [selectedName, setSelectedName] = useState("Ground Floor");
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [floorsOpen, setFloorsOpen] = useState(true);

  /* refs */
  const listRef = useRef(null);
  const bottomRef = useRef(null);

  const floors = [
    "Ground Floor",
    "2nd Floor",
    "3rd Floor",
    "4th Floor",
    "5th Floor",
  ];

  /* ─────────────── Socket + recipients list ─────────────── */
  useEffect(() => {
    fetchRecipients();
    socket.emit("join", { userId: "admin" });

    const handleNewMessage = (msg) => {
      const isCurrent = msg.sender === selectedId || msg.receiver === selectedId;

      if (isCurrent) {
        setMessages((prev) => {
          const idx = prev.findIndex(
            (m) =>
              m.localId &&
              m.content === msg.content &&
              m.sender === msg.sender &&
              m.receiver === msg.receiver
          );
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = msg;
            return copy;
          }
          return [...prev, msg];
        });
      }

      const otherId = msg.sender !== "admin" ? msg.sender : msg.receiver;
      if (floors.includes(otherId)) return;

      setRecipients((prev) => {
        const idx = prev.findIndex((u) => u._id === otherId);
        const updatedUser = {
          _id: otherId,
          name: msg.senderName || otherId,
          latestMessageAt: msg.createdAt,
        };

        let updatedList;
        if (idx !== -1) {
          const existing = { ...prev[idx], latestMessageAt: msg.createdAt };
          updatedList = [
            existing,
            ...prev.slice(0, idx),
            ...prev.slice(idx + 1),
          ];
        } else {
          updatedList = [updatedUser, ...prev];
        }

        return updatedList.sort(
          (a, b) => new Date(b.latestMessageAt) - new Date(a.latestMessageAt)
        );
      });
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [selectedId]);

  /* ─────────────── Load conversation on selection ─────────────── */
  useEffect(() => {
    socket.emit("join", { userId: selectedId });
    fetchMessages();
  }, [selectedId]);

  /* ─────────────── Auto‑scroll ─────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ─────────────── Helpers ─────────────── */
  const fetchRecipients = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        "http://localhost:5000/api/messages/recipients/admin"
      );
      const filtered = res.data
        .filter((r) => !floors.includes(r.name))
        .sort(
          (a, b) => new Date(b.latestMessageAt) - new Date(a.latestMessageAt)
        );
      setRecipients(filtered);
    } catch (err) {
      console.error("Failed to fetch recipients:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/messages/conversation/admin/${selectedId}`
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const tempMsg = {
      _id: "temp-" + Date.now(),
      localId: Date.now(),
      sender: "admin",
      senderName: "You",
      receiver: selectedId,
      content: newMessage,
      createdAt: new Date().toISOString(),
      status: "sending",
    };

    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage("");

    try {
      await axios.post("http://localhost:5000/api/messages", {
        sender: "admin",
        receiver: selectedId,
        content: newMessage,
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    const opt = { hour: "numeric", minute: "2-digit", hour12: true };
    return new Date().toDateString() === d.toDateString()
      ? d.toLocaleTimeString([], opt)
      : d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getAvatar = (name) => {
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#F033FF", "#FF33A8"];
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const color = colors[hash % colors.length];
    
    return (
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
        style={{ backgroundColor: color }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  };

  const filteredRecipients = recipients.filter(recipient =>
    recipient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <AdminNavigation setView={setView} currentView="adminMessage" />
      <div className="ml-[250px] w-[calc(100%-250px)] flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#CC0000]">Message Center</h1>
              <p className="text-gray-600">Communicate with users and floors</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Conversations */}
          <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  Loading conversations...
                </div>
              ) : (
                <>
                  {/* Floors Section */}
                  <div className="border-b border-gray-200">
                    <button 
                      className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                      onClick={() => setFloorsOpen(!floorsOpen)}
                    >
                      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center">
                        <Home className="mr-2" size={16} /> Floors
                      </h2>
                      <ChevronDown 
                        size={16} 
                        className={`transition-transform ${floorsOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    
                    <div className={`pl-2 pr-2  overflow-hidden transition-all duration-200 ${floorsOpen ? 'max-h-96' :  'max-h-0'}`}>
                      <div className="space-y-1">
                        {floors.map((floor) => (
                          <button
                            key={floor}
                            onClick={() => {
                              setSelectedId(floor);
                              setSelectedName(floor);
                            }}
                            className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                              selectedId === floor
                                ? "bg-gradient-to-r from-red-100 to-red-50 border-l-4 border-red-500"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            <div className="bg-gray-200 p-2 rounded-full mr-3">
                              <User className="text-gray-600" size={16} />
                            </div>
                            <span className={selectedId === floor ? "font-semibold text-red-700" : "font-medium"}>
                              {floor}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Users Section */}
                  <div className="p-4">
                    <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                      <Users className="mr-2" size={16} /> Users
                    </h2>
                    {filteredRecipients.length === 0 ? (
                      <p className="text-sm text-gray-500 p-2">No users found</p>
                    ) : (
                      <div className="space-y-1">
                        {filteredRecipients.map((r) => (
                          <button
                            key={r._id}
                            onClick={() => {
                              setSelectedId(r._id);
                              setSelectedName(r.name);
                            }}
                            className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                              selectedId === r._id
                                ? "bg-gradient-to-r from-red-100 to-red-50 border-l-4 border-red-500"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            {getAvatar(r.name)}
                            <div className="ml-3 flex-1 text-left">
                              <div className={`flex justify-between items-center ${
                                selectedId === r._id ? "font-semibold text-red-700" : "font-medium"
                              }`}>
                                <span>{r.name}</span>
                                <span className="text-xs text-gray-500">
                                  {formatTime(r.latestMessageAt)}
                                </span>
                                
                              </div>
                              
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Side - Chat Area */}
          <div className="flex-1 flex flex-col bg-white">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center">
              {getAvatar(selectedName)}
              <div className="ml-3">
                <h2 className="font-semibold text-lg">{selectedName}</h2>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={listRef}
              className="flex-1 overflow-y-auto p-6 bg-gray-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">Loading messages...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageSquare className="text-5xl mb-4" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isMe = msg.sender === "admin";
                    const isFloor = floors.includes(msg.sender);

                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl p-4 ${
                            isMe
                              ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                              : isFloor
                              ? "bg-gray-200 text-gray-800"
                              : "bg-white border border-gray-200 text-gray-800"
                          } shadow-sm`}
                        >
                          {!isMe && !isFloor && (
                            <div className="flex items-center mb-1">
                              {getAvatar(msg.senderName || msg.sender)}
                              <span className="ml-2 font-medium text-sm">
                                {msg.senderName || msg.sender}
                              </span>
                            </div>
                          )}
                          <p className={`whitespace-pre-wrap ${
                            isMe ? "text-white" : "text-gray-800"
                          }`}>
                            {msg.content}
                          </p>
                          <div className={`flex justify-end mt-1 ${
                            isMe ? "text-red-100" : "text-gray-500"
                          }`}>
                            <span className="text-xs">
                              {formatTime(msg.createdAt)}
                              {msg.status === "sending" && " • Sending..."}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center rounded-lg border border-gray-300 overflow-hidden shadow-sm">
                <input
                  className="flex-1 px-4 py-3 focus:outline-none"
                  placeholder={`Message ${selectedName}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className={`px-5 py-3 flex items-center justify-center ${
                    newMessage.trim()
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                      : "bg-gray-200 text-gray-400"
                  } transition-colors`}
                >
                  <Send className="text-xl" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminMessages;