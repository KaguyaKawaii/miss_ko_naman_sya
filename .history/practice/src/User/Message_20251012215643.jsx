import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function Message({ user, setView, currentView }) { // Add setView and currentView props
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("Ground Floor");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("floor");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({
    floor: 0,
    admin: 0
  });
  const [floorUnreadCounts, setFloorUnreadCounts] = useState({});
  
  // Track unread message IDs - fetched from server
  const [unreadMessageIds, setUnreadMessageIds] = useState(new Set());

  const floors = [
    "Ground Floor",
    "Second Floor",
    "Fourth Floor",
    "Fifth Floor"
  ];

  const messagesEndRef = useRef(null);
  const messageSound = useRef(new Audio("/ringtone_message.wav"));

  useEffect(() => {
    try { messageSound.current.volume = 0.75; } catch (e) {}
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 📌 Fetch unread counts for all floors
  const fetchAllUnreadCounts = async () => {
    if (!user?._id) return;

    try {
      // Fetch unread counts for each floor
      const floorCounts = {};
      
      for (const floor of floors) {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/messages/unread-count/${user._id}/${floor}`
          );
          floorCounts[floor] = response.data.count || 0;
        } catch (err) {
          console.error(`Failed to fetch unread count for ${floor}:`, err);
          floorCounts[floor] = 0;
        }
      }

      setFloorUnreadCounts(floorCounts);

      // Calculate total floor unread count
      const totalFloorUnread = Object.values(floorCounts).reduce((sum, count) => sum + count, 0);
      
      // Fetch admin unread count
      const adminResponse = await axios.get(
        `http://localhost:5000/api/messages/unread-count/${user._id}/admin`
      );

      setUnreadCounts({
        floor: totalFloorUnread,
        admin: adminResponse.data.count || 0
      });
    } catch (err) {
      console.error("Failed to fetch unread counts:", err);
      setUnreadCounts({ floor: 0, admin: 0 });
      
      // Initialize floor counts to 0 if fetch fails
      const initialCounts = {};
      floors.forEach(floor => {
        initialCounts[floor] = 0;
      });
      setFloorUnreadCounts(initialCounts);
    }
  };

  // 📌 Fetch unread messages from server (CLOUD-BASED)
  const fetchUnreadMessages = async () => {
    if (!user?._id) return;
    
    try {
      const response = await axios.get(
        `http://localhost:5000/api/messages/unread-messages/${user._id}`
      );
      
      if (response.data.success) {
        const unreadIds = response.data.unreadMessages.map(msg => msg._id);
        setUnreadMessageIds(new Set(unreadIds));
      }
    } catch (error) {
      console.error("Failed to fetch unread messages from cloud:", error);
    }
  };

  // 📌 Mark messages as read ONLY when user replies (CLOUD-BASED) - FIXED
  const markMessagesAsReadOnReply = async () => {
    try {
      let receiver = activeTab === "floor" ? selectedFloor : "admin";
      
      const response = await axios.post("http://localhost:5000/api/messages/mark-read-on-reply", {
        userId: user._id,
        receiver: receiver,
        conversationType: activeTab
      });
      
      if (response.data.success) {
        // Clear local unread IDs for current conversation
        setUnreadMessageIds(new Set());
        
        // Refresh unread counts
        await fetchAllUnreadCounts();
        await fetchUnreadMessages(); // Also refresh unread messages
      }
    } catch (error) {
      console.warn("Failed to mark messages as read in cloud:", error.message);
    }
  };

  // 📌 Mark conversation as read (CLOUD-BASED)
  const markConversationAsRead = async () => {
    try {
      let receiver = activeTab === "floor" ? selectedFloor : "admin";
      
      const response = await axios.post("http://localhost:5000/api/messages/mark-conversation-read", {
        userId: user._id,
        receiver: receiver,
        conversationType: activeTab
      });
      
      if (response.data.success) {
        // Clear local unread IDs for current conversation
        setUnreadMessageIds(new Set());
        
        // Refresh unread counts
        await fetchAllUnreadCounts();
        await fetchUnreadMessages(); // Also refresh unread messages
      }
    } catch (error) {
      console.warn("Failed to mark conversation as read in cloud:", error.message);
    }
  };

  // FIXED: Socket event handling
  useEffect(() => {
    if (!user?._id) return;

    // Join user's personal room, floor room, and admin room
    socket.emit("join", { userId: user._id });
    socket.emit("join", { userId: user.floor });
    socket.emit("join", { userId: "admin" });

    // Fetch initial data
    fetchAllUnreadCounts();
    fetchUnreadMessages();
    
    if (activeTab === "floor") {
      fetchMessages();
    } else {
      fetchAdminMessages();
    }

    const handleNewMessage = (msg) => {
      console.log("New message received in User Messages:", msg);
      
      setMessages(prev => {
        const filtered = prev.filter(m =>
          !(m.status === "sending" &&
            m.content === msg.content &&
            m.sender === msg.sender)
        );
        const exists = filtered.find(m => m._id === msg._id);
        if (exists) return filtered;
        
        if (activeTab === "floor") {
          // FIXED: Simplified message matching logic
          const isRelevant =
            (msg.receiver === user._id && msg.floor === selectedFloor) ||
            (msg.sender === user._id && msg.receiver === selectedFloor) ||
            (msg.floor === selectedFloor && msg.sender !== user._id);

          if (isRelevant) {
            if (msg.sender !== user._id) {
              try {
                messageSound.current.currentTime = 0;
                messageSound.current.play().catch(() => {});
                
                // Add to unread IDs
                setUnreadMessageIds(prev => {
                  const newUnreads = new Set(prev);
                  newUnreads.add(msg._id);
                  return newUnreads;
                });
                
                // Update unread counts for the specific floor
                if (msg.floor === selectedFloor) {
                  setFloorUnreadCounts(prev => ({
                    ...prev,
                    [msg.floor]: (prev[msg.floor] || 0) + 1
                  }));
                  
                  // Update total floor unread count
                  setUnreadCounts(prev => ({
                    ...prev,
                    floor: prev.floor + 1
                  }));
                }
              } catch (e) {}
            }
            return [...filtered, msg];
          }
        } else if (activeTab === "admin") {
          // FIXED: Simplified admin message matching
          const isRelevant =
            (msg.sender === user._id && msg.receiver === "admin") ||
            (msg.sender === "admin" && msg.receiver === user._id);

          if (isRelevant) {
            if (msg.sender !== user._id) {
              try {
                messageSound.current.currentTime = 0;
                messageSound.current.play().catch(() => {});
                
                // Add to unread IDs
                setUnreadMessageIds(prev => {
                  const newUnreads = new Set(prev);
                  newUnreads.add(msg._id);
                  return newUnreads;
                });
                
                // Increment unread count for new incoming messages
                setUnreadCounts(prev => ({
                  ...prev,
                  admin: prev.admin + 1
                }));
              } catch (e) {}
            }
            return [...filtered, msg];
          }
        }
        return filtered;
      });
    };

    // Handle unread count updates from socket
    const handleUnreadCountUpdate = (data) => {
      if (data.userId === user._id) {
        fetchAllUnreadCounts();
        fetchUnreadMessages();
      }
    };

    // Handle refresh unread counts
    const handleRefreshUnreadCounts = (data) => {
      if (data.userId === user._id) {
        fetchAllUnreadCounts();
        fetchUnreadMessages();
      }
    };

    // FIXED: Proper socket event listeners
    socket.on("newMessage", handleNewMessage);
    socket.on("unreadCountUpdate", handleUnreadCountUpdate);
    socket.on("refresh-unread-counts", handleRefreshUnreadCounts);

    return () => {
      // FIXED: Clean up all event listeners
      socket.off("newMessage", handleNewMessage);
      socket.off("unreadCountUpdate", handleUnreadCountUpdate);
      socket.off("refresh-unread-counts", handleRefreshUnreadCounts);
    };
  }, [user, selectedFloor, activeTab]);

  // 📌 Fetch unread counts when tab or floor changes
  useEffect(() => {
    if (user?._id) {
      fetchAllUnreadCounts();
      fetchUnreadMessages();
    }
  }, [activeTab, selectedFloor, user?._id]);

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

  // FIXED: Improved sendMessage function
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    let tempMsg;
    let receiver = activeTab === "floor" ? selectedFloor : "admin";
    
    tempMsg = {
      _id: "temp-" + Date.now(),
      sender: user._id,
      receiver: receiver,
      content: newMessage,
      createdAt: new Date().toISOString(),
      status: "sending",
      senderName: user.name,
      floor: activeTab === "floor" ? selectedFloor : undefined // Add floor for better routing
    };

    setMessages(prev => [...prev, tempMsg]);
    setNewMessage("");

    try {
      // 📌 MARK MESSAGES AS READ IN CLOUD ONLY WHEN USER REPLIES
      await markMessagesAsReadOnReply();
      
      if (activeTab === "floor") {
        await axios.post("http://localhost:5000/api/messages/send-to-floor", {
          userId: user._id,
          floor: selectedFloor,
          content: newMessage
        });
      } else {
        await axios.post("http://localhost:5000/api/messages/send-to-admin", {
          userId: user._id,
          content: newMessage
        });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages(prev => prev.map(msg => 
        msg._id === tempMsg._id ? { ...msg, status: "failed" } : msg
      ));
    }
  };

  const formatTime = (iso) => {
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (iso) => {
    const date = new Date(iso);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isToday = (iso) => {
    const date = new Date(iso);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isYesterday = (iso) => {
    const date = new Date(iso);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMessages([]);
    if (tab === "floor") {
      fetchMessages();
    } else {
      fetchAdminMessages();
    }
    setIsSidebarOpen(false);
  };

  const handleFloorSelect = (floor) => {
    setSelectedFloor(floor);
    setMessages([]);
    fetchMessages();
    setIsSidebarOpen(false);
  };

  // Get current unread count for display
  const getCurrentUnreadCount = () => {
    if (activeTab === "floor") {
      return floorUnreadCounts[selectedFloor] || 0;
    } else {
      return unreadCounts.admin;
    }
  };

  // Check if message is unread - BASED ON CLOUD DATA
  const isMessageUnread = (messageId) => {
    return unreadMessageIds.has(messageId);
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate();

  return (
    <main className="ml-0 lg:ml-[250px] w-full lg:w-[calc(100%-250px)] h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* HEADER - REMOVE THE SIDEBAR TOGGLE BUTTON SINCE WE'RE USING NAVIGATION_USER'S SIDEBAR */}
      <header className="text-black px-4 lg:px-6 h-16 lg:h-[60px] flex items-center justify-between shadow-sm lg:shadow-lg border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          {/* REMOVED the sidebar toggle button since we're using Navigation_User's sidebar */}
          <h1 className="text-xl lg:text-2xl font-bold tracking-wide bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Messages
          </h1>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* REMOVE the entire Sidebar section since we're using Navigation_User's sidebar */}

        {/* Chat Area - Make it full width since we removed the sidebar */}
        <div className="flex-1 flex flex-col w-full">
          {/* Chat Header */}
          <div className="bg-white p-4 lg:p-6 border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  activeTab === "floor" ? "bg-gradient-to-r from-red-500 to-orange-500" : "bg-gradient-to-r from-blue-500 to-cyan-500"
                }`}></div>
                <div>
                  <h2 className="text-lg lg:text-xl font-bold text-gray-800">
                    {activeTab === "floor" ? selectedFloor : "Administration Team"}
                  </h2>
                  <p className="text-xs lg:text-sm text-gray-600 mt-1 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {activeTab === "floor" 
                      ? `${selectedFloor} maintenance and support team` 
                      : "System administrators and support staff"
                    }
                  </p>
                </div>
              </div>
              {getCurrentUnreadCount() > 0 && (
                <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                  {getCurrentUnreadCount()} unread message{getCurrentUnreadCount() !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gradient-to-b from-white to-gray-50">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading messages...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-center text-gray-500 max-w-sm">
                  <div className="text-6xl mb-4 opacity-60">💬</div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">No messages yet</h3>
                  <p className="text-gray-600 mb-4">Start a conversation by sending a message below!</p>
                  <div className="w-16 h-1 bg-gradient-to-r from-gray-300 to-transparent rounded-full mx-auto"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 max-w-full mx-auto">
                {Object.entries(messageGroups).map(([date, dateMessages]) => (
                  <div key={date}>
                    {/* Date Separator */}
                    <div className="flex items-center justify-center my-6">
                      <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                        {isToday(date) ? 'Today' : isYesterday(date) ? 'Yesterday' : formatDate(date)}
                      </div>
                    </div>
                    
                    {/* Messages for this date */}
                    <div className="space-y-4">
                      {dateMessages.map(msg => (
                        <div key={msg._id} className={`flex ${msg.sender === user._id ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] lg:max-w-[70%] rounded-2xl p-4 shadow-sm transition-all duration-300 hover:shadow-md relative ${
                            msg.sender === user._id 
                              ? activeTab === "floor" 
                                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-br-none' 
                                : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-none'
                              : 'bg-white border border-gray-200 rounded-bl-none shadow-sm'
                          }`}>
                            {/* NEW BADGE for unread messages - FROM CLOUD DATABASE */}
                            {isMessageUnread(msg._id) && msg.sender !== user._id && (
                              <div className="absolute -top-2 -left-2 z-10">
                                <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center animate-pulse">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                  </svg>
                                  NEW
                                </span>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-semibold">
                                {msg.sender === user._id ? 'You' : msg.senderName}
                              </div>
                              {msg.status === "sending" && (
                                <div className="text-xs opacity-80 flex items-center">
                                  <svg className="w-3 h-3 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4m8-10h-4M6 12H2" />
                                  </svg>
                                  Sending...
                                </div>
                              )}
                              {msg.status === "failed" && (
                                <div className="text-xs opacity-80 text-red-200 flex items-center">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Failed
                                </div>
                              )}
                            </div>
                            <div className="text-sm leading-relaxed break-words">{msg.content}</div>
                            <div className={`text-xs mt-2 text-right flex items-center justify-end ${
                              msg.sender === user._id 
                                ? activeTab === "floor" ? 'text-red-100' : 'text-blue-100'
                                : 'text-gray-500'
                            }`}>
                              {formatTime(msg.createdAt)}
                              {msg.sender === user._id && (
                                <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="bg-white p-4 lg:p-6 border-t border-gray-200 shadow-lg">
            <div className="max-w-full mx-auto">
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder={
                    activeTab === "floor" 
                      ? `Message ${selectedFloor}...` 
                      : "Message administration..."
                  }
                  className="flex-1 border-2 border-gray-200 rounded-full px-4 lg:px-6 py-3 focus:outline-none focus:border-red-500 transition-colors duration-300 shadow-sm bg-gray-50 focus:bg-white"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className={`text-white rounded-full p-3 lg:px-8 lg:py-3 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center ${
                    activeTab === "floor" 
                      ? "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600" 
                      : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  }`}
                >
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span className="hidden lg:inline ml-2">Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Message;