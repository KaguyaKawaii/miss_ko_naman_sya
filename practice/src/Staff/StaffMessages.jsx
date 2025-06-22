import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function StaffMessages() {
  const [messages, setMessages] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [selectedId, setSelectedId] = useState("Ground Floor");
  const [selectedName, setSelectedName] = useState("Ground Floor");
  const [newMessage, setNewMessage] = useState("");

  const listRef = useRef(null);
  const bottomRef = useRef(null);

  const floors = ["Ground Floor", "2nd Floor", "4th Floor", "5th Floor"];

  useEffect(() => {
    fetchRecipients();
    socket.emit("join", { userId: "staff" });

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

      const otherId = msg.sender !== "staff" ? msg.sender : msg.receiver;
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

  useEffect(() => {
    socket.emit("join", { userId: selectedId });
    fetchMessages();
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchRecipients = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/messages/recipients/staff");
      const filtered = res.data
        .filter((r) => !floors.includes(r.name))
        .sort((a, b) => new Date(b.latestMessageAt) - new Date(a.latestMessageAt));
      setRecipients(filtered);
    } catch (err) {
      console.error("Failed to fetch recipients:", err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/messages/conversation/staff/${selectedId}`
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const tempMsg = {
      _id: "temp-" + Date.now(),
      localId: Date.now(),
      sender: "staff",
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
        sender: "staff",
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
      ? `Today • ${d.toLocaleTimeString([], opt)}`
      : d.toLocaleString();
  };

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">
      <header className="bg-[#CC0000] text-white pl-5 h-[50px] flex items-center">
        <h1 className="text-2xl font-semibold">Staff Messages</h1>
      </header>

      <div className="flex flex-1 h-[calc(100vh-50px)]">
        <div className="w-[20rem] p-4 bg-white border-r border-gray-300">
          <div className="border border-gray-200 rounded-lg h-full overflow-y-auto p-4 space-y-2">
            <h2 className="text-lg font-semibold mb-2 text-center">Conversations</h2>
            <div className="border-t border-gray-300 my-3" />
            {floors.map((floor) => (
              <div
                key={floor}
                onClick={() => {
                  setSelectedId(floor);
                  setSelectedName(floor);
                }}
                className={`p-3 rounded-lg cursor-pointer ${
                  selectedId === floor ? "bg-[#CC0000] text-white" : "hover:bg-gray-200"
                }`}
              >
                {floor}
              </div>
            ))}

            {recipients.length > 0 && <div className="border-t border-gray-300 my-3" />}

            {recipients.map((r) => (
              <div
                key={r._id}
                onClick={() => {
                  setSelectedId(r._id);
                  setSelectedName(r.name);
                }}
                className={`p-3 rounded-lg cursor-pointer ${
                  selectedId === r._id ? "bg-[#CC0000] text-white" : "hover:bg-gray-200"
                }`}
              >
                {r.name}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 p-4 bg-white flex flex-col">
          <div
            ref={listRef}
            className="border border-gray-200 rounded-lg flex-1 overflow-y-auto p-4 space-y-2 flex flex-col"
          >
            {messages.length ? (
              messages.map((msg) => {
                const isMe = msg.sender === "staff";

                return (
                  <div
                    key={msg._id}
                    className={`p-3 rounded-xl max-w-[70%] border border-gray-200 ${
                      isMe ? "bg-blue-300 ml-auto text-right" : "bg-gray-200 mr-auto"
                    }`}
                  >
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {isMe ? "You" : msg.senderName || msg.sender} • {formatTime(msg.createdAt)}
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

          <div className="mt-4 flex">
            <input
              className="flex-1 border border-gray-200 rounded-l-lg px-4 py-2 focus:outline-none"
              placeholder={`Message ${selectedName}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="bg-[#CC0000] text-white px-6 rounded-r-lg hover:bg-red-700"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default StaffMessages;
