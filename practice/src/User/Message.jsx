// Message.jsx (User Perspective)
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function Message({ user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("Ground Floor");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("floor"); // "floor" or "admin"

  const floors = [
    "Ground Floor",
    "Second Floor", 
    
    "Fourth Floor",
    "Fifth Floor"
  ];

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user?._id) return;

    // Join user's room and floor room
    socket.emit("join", { userId: user._id });
    socket.emit("join", { userId: user.floor });
    socket.emit("join", { userId: "admin" });

    if (activeTab === "floor") {
      fetchMessages();
    } else {
      fetchAdminMessages();
    }

    const handleNewMessage = (msg) => {
      if (activeTab === "floor") {
        // Check if message is relevant to current floor conversation
        const isRelevant = 
          (msg.receiver === user._id && msg.floor === selectedFloor) ||
          (msg.sender === user._id && msg.receiver === selectedFloor);

        if (isRelevant) {
          setMessages(prev => {
            const existing = prev.find(m => m._id === msg._id);
            return existing ? prev : [...prev, msg];
          });
        }
      } else if (activeTab === "admin") {
        // Check if message is relevant to admin conversation
        const isRelevant = 
          (msg.sender === user._id && msg.receiver === "admin") ||
          (msg.sender === "admin" && msg.receiver === user._id);

        if (isRelevant) {
          setMessages(prev => {
            const existing = prev.find(m => m._id === msg._id);
            return existing ? prev : [...prev, msg];
          });
        }
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [user, selectedFloor, activeTab]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `http://localhost:5000/api/messages/floor-conversation/${user._id}/${selectedFloor}`
      );
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminMessages = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `http://localhost:5000/api/messages/user-admin-conversation/${user._id}`
      );
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch admin messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    let tempMsg;
    
    if (activeTab === "floor") {
      tempMsg = {
        _id: "temp-" + Date.now(),
        sender: user._id,
        receiver: selectedFloor,
        content: newMessage,
        createdAt: new Date().toISOString(),
        status: "sending",
        senderName: user.name
      };

      setMessages(prev => [...prev, tempMsg]);
      setNewMessage("");

      try {
        await axios.post("http://localhost:5000/api/messages/send-to-floor", {
          userId: user._id,
          floor: selectedFloor,
          content: newMessage
        });
      } catch (err) {
        console.error("Failed to send message:", err);
        setMessages(prev => prev.map(msg => 
          msg._id === tempMsg._id ? { ...msg, status: "failed" } : msg
        ));
      }
    } else if (activeTab === "admin") {
      tempMsg = {
        _id: "temp-" + Date.now(),
        sender: user._id,
        receiver: "admin",
        content: newMessage,
        createdAt: new Date().toISOString(),
        status: "sending",
        senderName: user.name
      };

      setMessages(prev => [...prev, tempMsg]);
      setNewMessage("");

      try {
        await axios.post("http://localhost:5000/api/messages/send-to-admin", {
          userId: user._id,
          content: newMessage
        });
      } catch (err) {
        console.error("Failed to send message to admin:", err);
        setMessages(prev => prev.map(msg => 
          msg._id === tempMsg._id ? { ...msg, status: "failed" } : msg
        ));
      }
    }
  };

  const formatTime = (iso) => {
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* HEADER */}
      <header className="text-black px-6 h-[60px] flex items-center justify-between shadow-lg border-b-gray-200 border-b bg-white">
        <h1 className="text-xl md:text-2xl font-bold tracking-wide">Messages</h1>
        
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-bold text-lg text-gray-800">Message Options</h2>
            <p className="text-sm text-gray-600 mt-1">Choose who to message</p>
          </div>
          
          {/* Tab Buttons */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => {
                  setActiveTab("floor");
                  setMessages([]);
                  fetchMessages();
                }}
                className={`p-4 rounded-xl text-left transition-all duration-200 transform hover:scale-[1.02] cursor-pointer ${
                  activeTab === "floor" 
                    ? "bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 shadow-md" 
                    : "hover:bg-gray-50 border-2 border-transparent"
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${activeTab === "floor" ? "bg-red-500" : "bg-gray-400"}`}></div>
                  <div>
                    <div className="font-semibold text-gray-800">Floor Staff</div>
                    <div className="text-sm text-gray-500 mt-1">Message floor staff</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  setActiveTab("admin");
                  setMessages([]);
                  fetchAdminMessages();
                }}
                className={`p-4 rounded-xl text-left transition-all duration-200 transform hover:scale-[1.02] cursor-pointer ${
                  activeTab === "admin" 
                    ? "bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-md" 
                    : "hover:bg-gray-50 border-2 border-transparent"
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${activeTab === "admin" ? "bg-blue-500" : "bg-gray-400"}`}></div>
                  <div>
                    <div className="font-semibold text-gray-800">Administration</div>
                    <div className="text-sm text-gray-500 mt-1">Contact admin</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Floor Selection (only show for floor tab) */}
          {activeTab === "floor" && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Select Floor</h3>
              <div className="space-y-2">
                {floors.map(floor => (
                  <button
                    key={floor}
                    onClick={() => setSelectedFloor(floor)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 transform hover:scale-[1.01] cursor-pointer ${
                      selectedFloor === floor 
                        ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg" 
                        : "hover:bg-gray-50 bg-white border border-gray-200"
                    }`}
                  >
                    <div className="font-medium">{floor}</div>
                    <div className={`text-sm ${selectedFloor === floor ? "text-red-100" : "text-gray-500"}`}>Staff</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Admin Info (only show for admin tab) */}
          {activeTab === "admin" && (
            <div className="p-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mr-3 shadow-sm"></div>
                  <span className="font-bold text-blue-800">Admin Support</span>
                </div>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Contact the administration for account issues, complaints, or general inquiries.
                  We're here to help you!
                </p>
              </div>
            </div>
          )}
        </aside>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white p-6 border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {activeTab === "floor" ? `${selectedFloor} Staff` : "Administration Team"}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {activeTab === "floor" 
                    ? "Floor maintenance and support team" 
                    : "System administrators and support staff"
                  }
                </p>
              </div>
             
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white to-gray-50">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading messages...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                  <p>Start a conversation by sending a message below!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-full mx-auto">
                {messages.map(msg => (
                  <div key={msg._id} className={`flex ${msg.sender === user._id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[100%] rounded-2xl p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
                      msg.sender === user._id 
                        ? activeTab === "floor" 
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-br-none' 
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-none'
                        : 'bg-white border-2 border-gray-100 rounded-bl-none shadow-sm'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold">
                          {msg.sender === user._id ? 'You' : msg.senderName}
                        </div>
                        {msg.status === "sending" && (
                          <div className="text-xs opacity-80">Sending...</div>
                        )}
                        {msg.status === "failed" && (
                          <div className="text-xs opacity-80 text-red-200">Failed</div>
                        )}
                      </div>
                      <div className="text-sm leading-relaxed">{msg.content}</div>
                      <div className={`text-xs mt-2 text-right ${
                        msg.sender === user._id 
                          ? activeTab === "floor" ? 'text-red-100' : 'text-blue-100'
                          : 'text-gray-500'
                      }`}>
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-center text-xs text-gray-400 mt-6">
                  <p>Communicate politely and professionally.</p>
                </div>
                <div ref={messagesEndRef} />
              </div>
              
            )}
          </div>

          {/* Message Input */}
          <div className="bg-white p-6 border-t border-gray-200 shadow-lg">
            <div className="max-w-full mx-auto">
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder={
                    activeTab === "floor" 
                      ? `Message ${selectedFloor} staff...` 
                      : "Message administration..."
                  }
                  className="flex-1 border-2 border-gray-200 rounded-full px-6 py-3 focus:outline-none focus:border-red-500 transition-colors duration-200 shadow-sm"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className={`text-white rounded-full px-8 py-3 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg ${
                    activeTab === "floor" 
                      ? "bg-gradient-to-r from-red-500 to-orange-500" 
                      : "bg-gradient-to-r from-blue-500 to-cyan-500"
                  }`}
                >
                  <span className="font-semibold">Send</span>
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-3 text-center">
                Messaging {activeTab === "floor" ? `${selectedFloor} Staff` : "Administration"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Message;