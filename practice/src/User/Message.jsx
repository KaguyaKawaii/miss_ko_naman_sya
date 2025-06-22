import { useEffect, useState, useRef } from "react";
import axios from "axios";

function Message({ user }) {
  // ──────────────────────────────── state
  const [messages, setMessages]         = useState([]);
  const [newMessage, setNewMessage]     = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState("admin");
  const [recipients] = useState([
    { id: "admin",        label: "Admin" },
    { id: "Ground Floor", label: "Ground Floor" },
    { id: "2nd Floor",    label: "2nd Floor" },
    { id: "4th Floor",    label: "4th Floor" },
    { id: "5th Floor",    label: "5th Floor" },
  ]);

  // ──────────────────────────────── refs
  const listRef      = useRef(null);  // messages scroll container
  const bottomRef    = useRef(null);  // dummy div at the end
  const forceScroll  = useRef(true);  // «scroll‑to‑bottom» flag

  // ──────────────────────────────── effects
  useEffect(() => {
    if (!user?._id || !selectedRecipient) return;

    fetchMessages();
    const id = setInterval(fetchMessages, 3000);     // poll every 3 s
    return () => clearInterval(id);
  }, [user, selectedRecipient]);

  // when messages update ──> possibly scroll
  useEffect(() => {
    if (!listRef.current) return;

    const el        = listRef.current;
    const nearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight <= 100; // ~100 px slack

    // if forced (initial / switch) OR already at bottom  -> scroll
    if (forceScroll.current || nearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      forceScroll.current = false;                       // reset after first use
    }
  }, [messages]);

  // when user picks a different recipient ──> force one initial scroll
  useEffect(() => {
    forceScroll.current = true;
  }, [selectedRecipient]);

  // ──────────────────────────────── helpers
  async function fetchMessages() {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/messages/conversation/${user._id}/${selectedRecipient}`
      );
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  }

  async function sendMessage() {
    if (!newMessage.trim()) return;

    // optimistic bubble
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
    forceScroll.current = true;               // ensure it scrolls after sending

    try {
      await axios.post("http://localhost:5000/api/messages", {
        sender: user._id,
        receiver: selectedRecipient,
        content: newMessage,
      });
      await fetchMessages();
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  }

  const formatTime = (iso) => {
    const now  = new Date();
    const date = new Date(iso);
    const opts = { hour: "numeric", minute: "2-digit", hour12: true };
    return now.toDateString() === date.toDateString()
      ? `Today • ${date.toLocaleTimeString([], opts)}`
      : date.toLocaleString();
  };

  // ──────────────────────────────── render
  return (
    <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#CC0000] text-white pl-5 h-[50px] flex items-center">
        <h1 className="text-2xl font-semibold">Messages</h1>
      </header>

      <div className="flex flex-1 h-[calc(100vh-50px)]">
        {/* Recipients */}
        <aside className="w-[20rem] p-4 bg-white border-r border-gray-300">
          <div className="border border-gray-200 rounded-lg h-full overflow-y-auto p-4">
            <h2 className="text-lg font-semibold mb-4 text-center">Conversations</h2>
            <div className="border-t border-gray-300 my-3" />

            {recipients.map(({ id, label }) => (
              <div
                key={id}
                onClick={() => setSelectedRecipient(id)}
                className={`p-3 mb-2 rounded-lg cursor-pointer ${
                  selectedRecipient === id
                    ? "bg-[#CC0000] text-white"
                    : "hover:bg-gray-200"
                }`}
              >
                {label}
              </div>
            ))}
          </div>
        </aside>

        {/* Messages */}
        <section className="flex-1 p-4 bg-white flex flex-col">
          <div
            ref={listRef}
            className="border border-gray-200 rounded-lg flex-1 overflow-y-auto p-4 space-y-2 flex flex-col"
          >
            {messages.length ? (
              messages.map((msg) => {
                const isMe =
                  msg.sender === user._id || msg.sender?._id === user._id;

                return (
                  <div
                    key={msg._id}
                    className={`p-3 rounded-xl max-w-[70%] border border-gray-200 ${
                      isMe
                        ? "bg-blue-300 ml-auto text-right"
                        : "bg-gray-200 mr-auto"
                    }`}
                  >
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {msg.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {isMe
                        ? "You"
                        : msg.senderName ||
                          msg.sender?.name ||
                          msg.sender}{" "}
                      • {formatTime(msg.createdAt)}
                      {msg.status === "sending" && " • Sending..."}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500">No messages yet.</p>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="mt-4 flex">
            <input
              className="flex-1 border border-gray-200 rounded-l-lg px-4 py-2 focus:outline-none"
              placeholder={`Message ${
                recipients.find((r) => r.id === selectedRecipient)?.label || "..."
              }...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-[#CC0000] text-white px-6 rounded-r-lg hover:bg-red-700 cursor-pointer"
            >
              Send
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Message;
