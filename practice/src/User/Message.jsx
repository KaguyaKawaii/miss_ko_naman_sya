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
      ? `Today • ${date.toLocaleTimeString([], opts)}`
      : date.toLocaleString();
  };

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col bg-gray-50">
      <header className="bg-[#CC0000] text-white pl-5 h-[50px] flex items-center shadow-sm">
        <h1 className="text-2xl font-semibold">Messages</h1>
      </header>

      <div className="flex flex-1 h-[calc(100vh-50px)]">
        <aside className="w-[20rem] p-4 bg-white border-r border-gray-200 shadow-inner">
          <div className="border border-gray-200 rounded-xl h-full overflow-y-auto p-4 bg-white shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-center text-gray-700">
              Conversations
            </h2>
            <div className="border-t border-gray-200 my-3" />

            {recipients.map(({ id, label }) => (
              <div
                key={id}
                onClick={() => setSelectedRecipient(id)}
                className={`p-3 mb-2 rounded-lg cursor-pointer transition-all ${
                  selectedRecipient === id
                    ? "bg-[#DC2626] text-white shadow-md"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {label}
              </div>
            ))}
          </div>
        </aside>

        <section className="flex-1 p-4 flex flex-col">
          <div
            ref={listRef}
            className="border border-gray-200 rounded-xl flex-1 overflow-y-auto p-4 space-y-3 flex flex-col bg-white shadow-inner"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="inline-block border-4 border-gray-200 border-t-red-500 rounded-full w-12 h-12 animate-spin mb-4"></div>
                <p className="text-gray-600">Loading messages...</p>
              </div>
            ) : messages.length ? (
              messages.map((msg) => {
                const isMe = msg.sender === user._id || msg.sender?._id === user._id;
                return (
                  <div
                    key={msg._id}
                    className={`p-3 rounded-2xl max-w-[75%] shadow-sm ${
                      isMe
                        ? "bg-[#2563EB] text-white ml-auto rounded-br-none"
                        : "bg-gray-100 text-gray-800 mr-auto rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isMe ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {isMe ? "You" : msg.senderName || msg.sender?.name || msg.sender} •{" "}
                      {formatTime(msg.createdAt)}
                      {msg.status === "sending" && " • Sending..."}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400 text-center mt-8 italic">
                No messages yet. Start a conversation!
              </p>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="mt-4 flex shadow-lg rounded-lg overflow-hidden">
            <input
              className="flex-1 px-4 py-3 focus:outline-none border-none bg-white"
              placeholder={`Message ${
                recipients.find((r) => r.id === selectedRecipient)?.label || "..."
              }...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-[#DC2626] text-white px-6 hover:bg-red-700 transition-colors"
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
