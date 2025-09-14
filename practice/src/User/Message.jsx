import { useEffect, useState, useRef } from "react";
import axios from "axios";

function Message({ user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState("admin");
  const [recipients] = useState([
    { id: "admin", label: "Admin" },
    { id: "Ground Floor", label: "Ground Floor" },
    { id: "2nd Floor", label: "2nd Floor" },
    { id: "4th Floor", label: "4th Floor" },
    { id: "5th Floor", label: "5th Floor" },
  ]);
  const [loading, setLoading] = useState(true);

  const listRef = useRef(null);
  const bottomRef = useRef(null);
  const forceScroll = useRef(true);

  useEffect(() => {
    if (!user?._id || !selectedRecipient) return;

    fetchMessages(true); // first load

    const id = setInterval(() => fetchMessages(false), 3000);
    return () => clearInterval(id);
  }, [user, selectedRecipient]);

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 100;
    if (forceScroll.current || nearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      forceScroll.current = false;
    }
  }, [messages]);

  useEffect(() => {
    forceScroll.current = true;
  }, [selectedRecipient]);

  async function fetchMessages(isInitial = false) {
    try {
      if (isInitial) setLoading(true);

      const { data } = await axios.get(
        `http://localhost:5000/api/messages/conversation/${user._id}/${selectedRecipient}`
      );
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }

  async function sendMessage() {
    if (!newMessage.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        _id: "temp-" + Date.now(),
        sender: user._id,
        senderName: user.name,
        receiver: selectedRecipient,
        content: newMessage,
        createdAt: new Date().toISOString(),
        status: "sending",
      },
    ]);
    setNewMessage("");
    forceScroll.current = true;

    try {
      await axios.post("http://localhost:5000/api/messages", {
        sender: user._id,
        receiver: selectedRecipient,
        content: newMessage,
      });
      await fetchMessages(false);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  }

  const formatTime = (iso) => {
    const now = new Date();
    const date = new Date(iso);
    const opts = { hour: "numeric", minute: "2-digit", hour12: true };
    return now.toDateString() === date.toDateString()
      ? date.toLocaleTimeString([], opts)
      : date.toLocaleDateString([], { month: "short", day: "numeric" }) + " " + date.toLocaleTimeString([], opts);
  };

  const getAvatar = (label) => {
    if (label === "Admin") return "A";
    if (label === "Ground Floor") return "G";
    return label.charAt(0); // "2" for 2nd Floor, etc.
  };

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col bg-gray-50">
      <header className="text-black bg-white px-6 h-[60px] flex items-center justify-between shadow-sm z-10">
        <h1 className="text-xl md:text-2xl font-bold tracking-wide">Messages</h1>
      </header>

      <div className="flex flex-1 h-[calc(100vh-60px)] overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto py-2">
            {recipients.map(({ id, label }) => (
              <div
                key={id}
                onClick={() => setSelectedRecipient(id)}
                className={`flex items-center p-3 mx-2 my-1 rounded-xl cursor-pointer transition-all ${
                  selectedRecipient === id
                    ? "bg-red-50 border border-red-200 shadow-xs"
                    : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 text-white font-medium ${
                  selectedRecipient === id ? "bg-red-500 shadow-xs" : "bg-gray-400"
                }`}>
                  {getAvatar(label)}
                </div>
                <div>
                  <p className={`font-medium ${
                    selectedRecipient === id ? "text-red-600" : "text-gray-700"
                  }`}>{label}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col bg-white border-l border-gray-200">
          {/* Chat header */}
          <div className="bg-white p-4 border-b border-gray-200 flex items-center shadow-sm">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-lg mr-3 ${
              selectedRecipient === "admin" ? "bg-red-500" : "bg-gray-500"
            }`}>
              {getAvatar(recipients.find(r => r.id === selectedRecipient)?.label)}
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">
                {recipients.find(r => r.id === selectedRecipient)?.label}
              </h2>
              <p className="text-xs text-gray-500">
                {selectedRecipient === "admin" ? "Building administrator" : "Floor residents"}
              </p>
            </div>
          </div>

          {/* Messages container */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto p-6 bg-gray-50"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="inline-block border-4 border-gray-200 border-t-red-500 rounded-full w-12 h-12 animate-spin mb-4"></div>
                <p className="text-gray-600">Loading messages...</p>
              </div>
            ) : messages.length ? (
              <div className="space-y-5">
                {messages.map((msg) => {
                  const isMe = msg.sender === user._id || msg.sender?._id === user._id;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      {!isMe && (
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium mr-2 mt-1 ${
                          selectedRecipient === "admin" ? "bg-red-500" : "bg-gray-500"
                        }`}>
                          {msg.senderName?.charAt(0) || msg.sender?.name?.charAt(0) || "U"}
                        </div>
                      )}
                      <div className={`max-w-[75%] ${isMe ? "flex flex-col items-end" : ""}`}>
                        {!isMe && (
                          <p className="text-xs font-medium text-gray-500 mb-1 ml-1">
                            {msg.senderName || msg.sender?.name || msg.sender}
                          </p>
                        )}
                        <div
                          className={`p-4 rounded-2xl ${
                            isMe
                              ? "bg-gradient-to-r from-red-500 to-red-600 text-white rounded-br-md"
                              : "bg-white text-gray-800 rounded-bl-md border border-gray-200 shadow-xs"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p
                            className={`text-xs mt-2 text-right ${
                              isMe ? "text-red-100" : "text-gray-500"
                            }`}
                          >
                            {formatTime(msg.createdAt)}
                            {msg.status === "sending" && (
                              <span className="ml-2 inline-flex">
                                <span className="animate-pulse">Sending</span>
                                <span className="ml-1 flex items-center">
                                  <span className="inline-block w-1.5 h-1.5 bg-current rounded-full animate-bounce mr-0.5"></span>
                                  <span className="inline-block w-1.5 h-1.5 bg-current rounded-full animate-bounce mr-0.5" style={{ animationDelay: '0.2s' }}></span>
                                  <span className="inline-block w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                </span>
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">No messages yet</h3>
                <p className="text-gray-500 max-w-md">
                  Start a conversation with the {selectedRecipient === "admin" ? "building administrator" : selectedRecipient.toLowerCase() + " residents"}
                </p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Message input */}
          <div className="bg-white border-t border-gray-200 p-4 shadow-sm">
            <div className="flex items-center rounded-xl border border-gray-300 bg-white focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all">
              <input
                className="flex-1 px-4 py-3 bg-transparent focus:outline-none text-gray-800 placeholder-gray-500"
                placeholder={`Message ${recipients.find(r => r.id === selectedRecipient)?.label}...`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className={`m-2 p-2 rounded-full transition-all ${
                  newMessage.trim()
                    ? "bg-red-500 text-white hover:bg-red-600 shadow-xs"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Message;