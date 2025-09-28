import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import AdminNavigation from "./AdminNavigation";
import { 
  MessageSquare, 
  Search, 
  X, 
  User, 
  Users, 
  Send,
  Clock
} from "lucide-react";

const socket = io("http://localhost:5000");

function AdminMessages({ setView }) {
  const [messages, setMessages] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedName, setSelectedName] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const listRef = useRef(null);
  const bottomRef = useRef(null);
  const searchRef = useRef(null);

  // Load initial data and setup socket
  useEffect(() => {
    fetchRecipients();
    fetchAllUsers();
    socket.emit("join", { userId: "admin" });

    // Restore last opened recipient
    const savedRecipient = localStorage.getItem("adminSelectedRecipient");
    if (savedRecipient) {
      try {
        const parsed = JSON.parse(savedRecipient);
        setSelectedId(parsed._id);
        setSelectedName(parsed.name);
        setSelectedType(parsed.type || "user");
      } catch (error) {
        console.error("Error parsing saved recipient:", error);
        localStorage.removeItem("adminSelectedRecipient");
      }
    }

    const handleNewMessage = (msg) => {
      const isCurrentConversation = msg.sender === selectedId || msg.receiver === selectedId;
      const involvesAdmin = msg.sender === "admin" || msg.receiver === "admin";

      if (isCurrentConversation) {
        setMessages((prev) => {
          const existing = prev.find(m => m._id === msg._id);
          if (existing) return prev;
          
          // Replace temporary message with real one
          const idx = prev.findIndex(
            (m) => m.localId && m.content === msg.content
          );
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = msg;
            return copy;
          }
          return [...prev, msg];
        });
      }

      // Always update recipients when a new message arrives
      if (involvesAdmin) {
        fetchRecipients();
      }
    };

    socket.on("newMessage", handleNewMessage);
    
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      socket.off("newMessage", handleNewMessage);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedId]);

  // Fetch messages when recipient changes
  useEffect(() => {
    if (selectedId) {
      socket.emit("join", { userId: selectedId });
      fetchMessages();
    }
  }, [selectedId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch recipients with proper merging and sorting
  const fetchRecipients = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        "http://localhost:5000/api/messages/recipients/admin"
      );

      // Filter out floors and ensure valid data
      const backendRecipients = res.data.filter(
        (recipient) =>
          recipient &&
          recipient._id &&
          recipient.name &&
          ![
            "Ground Floor",
            "Second Floor",
            "Third Floor",
            "Fourth Floor",
            "Fifth Floor",
          ].includes(recipient._id)
      );

      // Merge with existing recipients, preserving search-added ones
      const existingRecipientsMap = new Map();
      recipients.forEach(recipient => {
        if (recipient && recipient._id) {
          existingRecipientsMap.set(recipient._id, recipient);
        }
      });

      // Start with backend recipients
      const mergedRecipients = [...backendRecipients];
      
      // Add existing recipients that aren't in backend (like searched users)
      recipients.forEach(recipient => {
        if (recipient && recipient._id) {
          const existsInBackend = backendRecipients.find(r => r._id === recipient._id);
          const existsInMerged = mergedRecipients.find(r => r._id === recipient._id);
          if (!existsInBackend && !existsInMerged) {
            mergedRecipients.push(recipient);
          }
        }
      });

      // Sort recipients: selected first, then by timestamp (newest first)
      const sortedRecipients = mergedRecipients.sort((a, b) => {
        if (!a || !b) return 0;
        
        // Selected recipient always goes to top
        if (a._id === selectedId) return -1;
        if (b._id === selectedId) return 1;
        
        // Then sort by timestamp (newest first)
        const timeA = new Date(a.timestamp || a.latestMessageTimestamp || a.createdAt || 0);
        const timeB = new Date(b.timestamp || b.latestMessageTimestamp || b.createdAt || 0);
        return timeB - timeA;
      });

      setRecipients(sortedRecipients);
    } catch (err) {
      console.error("Failed to fetch recipients:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      if (res.data.success) {
        const usersAndStaff = res.data.users.filter(user => 
          user && !user.archived && user.role !== "admin"
        );
        setAllUsers(usersAndStaff);
      }
    } catch (err) {
      console.error("Failed to fetch all users:", err);
    }
  };

  const searchUsers = async (term) => {
    if (!term.trim()) {
      setShowSearchDropdown(false);
      return;
    }

    setSearchLoading(true);
    setShowSearchDropdown(true);
    setSearchLoading(false);
  };

  // Handle selecting a user from search results
  const handleSearchSelect = (user) => {
    if (!user || !user._id) return;
    
    setSearchTerm("");
    setShowSearchDropdown(false);
    
    // Check if user already exists in recipients
    const existingRecipient = recipients.find(r => r && r._id === user._id);
    
    if (!existingRecipient) {
      // Create new recipient object with proper structure
      const newRecipient = {
        _id: user._id,
        name: user.name,
        type: user.role === "staff" ? "staff" : "user",
        email: user.email,
        department: user.department,
        latestMessage: "New conversation",
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      // Add to recipients and reorder
      const updatedRecipients = [newRecipient, ...recipients];
      setRecipients(updatedRecipients);
    }
    
    // Select the user and save to localStorage
    const recipientToSelect = existingRecipient || {
      _id: user._id,
      name: user.name,
      type: user.role === "staff" ? "staff" : "user"
    };
    
    handleSelectRecipient(recipientToSelect);
  };

  // Handle selecting a recipient from the list
  const handleSelectRecipient = (recipient) => {
    if (!recipient || !recipient._id) return;

    // Save selected recipient to localStorage
    localStorage.setItem("adminSelectedRecipient", JSON.stringify(recipient));
    
    // Update timestamp to move this conversation to top
    const updatedRecipients = recipients.map(r => {
      if (!r) return r;
      return r._id === recipient._id 
        ? { ...r, timestamp: new Date().toISOString() }
        : r;
    }).filter(r => r !== undefined);
    
    // Sort with selected recipient at top
    const sortedRecipients = updatedRecipients.sort((a, b) => {
      if (!a || !b) return 0;
      if (a._id === recipient._id) return -1;
      if (b._id === recipient._id) return 1;
      
      const timeA = new Date(a.timestamp || a.createdAt || 0);
      const timeB = new Date(b.timestamp || b.createdAt || 0);
      return timeB - timeA;
    });

    setRecipients(sortedRecipients);
    setSelectedId(recipient._id);
    setSelectedName(recipient.name);
    setSelectedType(getRecipientType(recipient));
    setShowSearchDropdown(false);
  };

  const fetchMessages = async () => {
    if (!selectedId) return;
    
    try {
      setIsLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/messages/admin-conversation/${selectedId}`
      );
      setMessages(res.data || []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Send a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedId) return;

    const tempMsg = {
      _id: "temp-" + Date.now(),
      localId: Date.now(),
      sender: "admin",
      senderName: "Admin",
      receiver: selectedId,
      content: newMessage,
      createdAt: new Date().toISOString(),
      status: "sending",
    };

    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage("");

    try {
      const response = await axios.post("http://localhost:5000/api/messages/send", {
        sender: "admin",
        receiver: selectedId,
        content: newMessage
      });
      
      // Replace temporary message with real one
      setMessages(prev => prev.map(msg => 
        msg.localId === tempMsg.localId 
          ? { ...response.data, status: "sent" }
          : msg
      ));

      // Update or create recipient in the list
      const updatedRecipients = recipients.map(recipient => {
        if (!recipient) return recipient;
        return recipient._id === selectedId
          ? { 
              ...recipient, 
              timestamp: new Date().toISOString(),
              latestMessage: newMessage,
              latestMessageTimestamp: new Date().toISOString()
            }
          : recipient;
      }).filter(r => r !== undefined);

      // If recipient doesn't exist in the list, create it
      if (!updatedRecipients.find(r => r._id === selectedId)) {
        const newRecipient = {
          _id: selectedId,
          name: selectedName,
          type: selectedType,
          latestMessage: newMessage,
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        updatedRecipients.unshift(newRecipient);
      }

      // Sort with current recipient at top
      const sortedRecipients = updatedRecipients.sort((a, b) => {
        if (!a || !b) return 0;
        if (a._id === selectedId) return -1;
        if (b._id === selectedId) return 1;
        
        const timeA = new Date(a.timestamp || a.createdAt || 0);
        const timeB = new Date(b.timestamp || b.createdAt || 0);
        return timeB - timeA;
      });

      setRecipients(sortedRecipients);
      
      // Update localStorage with current recipient
      const currentRecipient = sortedRecipients.find(r => r._id === selectedId);
      if (currentRecipient) {
        localStorage.setItem("adminSelectedRecipient", JSON.stringify(currentRecipient));
      }

    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages(prev => prev.map(msg => 
        msg.localId === tempMsg.localId 
          ? { ...msg, status: "failed" }
          : msg
      ));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return "";
    }
  };

  const formatMessageTime = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      
      return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      return "";
    }
  };

  const getAvatar = (name, type = "user") => {
    const colors = {
      staff: "#059669", 
      user: "#DC2626",
      admin: "#7C3AED"
    };
    
    const color = colors[type] || "#6B7280";
    
    return (
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-base shadow-md"
        style={{ backgroundColor: color }}
      >
        {name ? name.charAt(0).toUpperCase() : "U"}
      </div>
    );
  };

  const getRecipientType = (recipient) => {
    return recipient.type || "user";
  };

  const filteredSearchResults = allUsers.filter(user =>
    user && (
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id_number?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ).slice(0, 5);

  return (
    <>
      <AdminNavigation setView={setView} currentView="adminMessage" />
      <div className="ml-[250px] w-[calc(100%-250px)] flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <header className="bg-white px-6 py-4 border-b border-gray-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#CC0000]">Message Center</h1>
              <p className="text-gray-600">Communicate with users and staff</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full shadow-sm">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden p-4 gap-4">
          {/* Sidebar */}
          <div className="w-80 bg-white rounded-2xl shadow-lg flex flex-col border border-gray-200">
            <div className="p-4 border-b border-gray-200 relative" ref={searchRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users or staff..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow-sm transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    searchUsers(e.target.value);
                  }}
                  onFocus={() => searchTerm && setShowSearchDropdown(true)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                {searchTerm && (
                  <button 
                    onClick={() => {
                      setSearchTerm("");
                      setShowSearchDropdown(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Search Dropdown */}
              {showSearchDropdown && searchTerm && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 mt-1 max-h-60 overflow-y-auto">
                  {searchLoading ? (
                    <div className="p-3 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mx-auto"></div>
                      <span className="text-sm ml-2">Searching...</span>
                    </div>
                  ) : filteredSearchResults.length > 0 ? (
                    filteredSearchResults.map((user) => (
                      <button
                        key={user._id}
                        onClick={() => handleSearchSelect(user)}
                        className="w-full flex items-center p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        {getAvatar(user.name, user.role === "staff" ? "staff" : "user")}
                        <div className="ml-3 text-left">
                          <div className="font-medium text-gray-900 text-sm">{user.name}</div>
                          <div className="text-xs text-gray-500">
                            {user.role === "staff" ? "Staff" : "User"}
                            {user.department && ` • ${user.department}`}
                            {user.email && ` • ${user.email}`}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500 text-sm">
                      No users found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto mb-2"></div>
                  Loading conversations...
                </div>
              ) : (
                <div className="p-2">
                  <div className="space-y-1">
                    {recipients.filter(r => r !== undefined).map((recipient) => (
                      <button
                        key={recipient._id}
                        onClick={() => handleSelectRecipient(recipient)}
                        className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${
                          selectedId === recipient._id
                            ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transform scale-[1.02]"
                            : "hover:bg-gray-50 hover:shadow-md"
                        }`}
                      >
                        {getAvatar(recipient.name, getRecipientType(recipient))}
                        <div className="ml-3 text-left flex-1 min-w-0">
                          <div className={`font-medium truncate ${
                            selectedId === recipient._id ? "text-white" : "text-gray-900"
                          }`}>
                            {recipient.name}
                          </div>
                          <div className={`text-xs truncate ${
                            selectedId === recipient._id ? "text-red-100" : "text-gray-500"
                          }`}>
                            {recipient.type === "staff" ? "Staff Member" : "User"}
                            {recipient.department && ` • ${recipient.department}`}
                          </div>
                          {recipient.latestMessage && (
                            <div className={`text-xs truncate mt-1 ${
                              selectedId === recipient._id ? "text-red-100" : "text-gray-400"
                            }`}>
                              {recipient.latestMessage}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {recipients.length === 0 && !searchTerm && (
                    <div className="text-center p-4 text-gray-500">
                      <Users className="mx-auto mb-2 text-gray-300" size={32} />
                      <p>No conversations yet</p>
                      <p className="text-sm">Search for users or staff to start messaging</p>
                    </div>
                  )}

                  {recipients.length === 0 && searchTerm && (
                    <div className="text-center p-4 text-gray-500">
                      <User className="mx-auto mb-2 text-gray-300" size={32} />
                      <p>No conversations found</p>
                      <p className="text-sm">Try searching for users or staff above</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-lg border border-gray-200">
            {selectedId ? (
              <>
                <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center">
                    {getAvatar(selectedName, selectedType)}
                    <div className="ml-3">
                      <h2 className="font-semibold text-gray-900 text-lg">{selectedName}</h2>
                      <p className="text-sm text-gray-500">
                        {selectedType === "staff" ? "Staff Member" : "User"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white to-gray-50">
                  <div className="space-y-4" ref={listRef}>
                    {isLoading ? (
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-gray-500 mt-16">
                        <MessageSquare className="mx-auto mb-4 text-gray-200" size={64} />
                        <p className="text-lg font-medium text-gray-400">No messages yet</p>
                        <p className="text-sm">Start a conversation by sending a message!</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg._id || msg.localId}
                          className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                              msg.sender === "admin"
                                ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                                : "bg-white border border-gray-200 text-gray-900"
                            } transition-all duration-200 hover:shadow-md`}
                          >
                            <div className="text-sm whitespace-pre-wrap break-words">{msg.content}</div>
                            <div className={`text-xs mt-2 flex items-center space-x-1 ${
                              msg.sender === "admin" ? "text-red-100" : "text-gray-500"
                            }`}>
                              <Clock size={12} />
                              <span>{formatTime(msg.createdAt)}</span>
                              {msg.status === "sending" && <span className="italic ml-2">Sending...</span>}
                              {msg.status === "failed" && <span className="text-yellow-200 ml-2">Failed</span>}
                            </div>
                            <div className={`text-xs mt-1 ${
                              msg.sender === "admin" ? "text-red-100" : "text-gray-500"
                            }`}>
                              {formatMessageTime(msg.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={bottomRef} />
                  </div>
                </div>

                <div className="border-t border-gray-200 bg-white p-4 rounded-b-2xl">
                  <div className="flex space-x-3">
                    <textarea
                      placeholder="Type your message... (Shift + Enter for new line)"
                      className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none transition-all duration-200"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      rows={1}
                      style={{ minHeight: "44px", maxHeight: "120px" }}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:scale-100 flex items-center space-x-2"
                    >
                      <Send size={18} />
                      <span className="font-medium">Send</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageSquare className="mx-auto mb-4 text-gray-200" size={64} />
                  <p className="text-lg font-medium text-gray-400">Select a conversation</p>
                  <p className="text-sm">Search for a user or staff member to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminMessages;