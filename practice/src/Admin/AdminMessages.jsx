import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminNavigation from "./AdminNavigation";

function AdminMessages({ setView }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = () => {
    setIsLoading(true);
    axios
      .get("http://localhost:5000/messages")
      .then((res) => setMessages(res.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  const handleDeleteMessage = (id) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      axios
        .delete(`http://localhost:5000/messages/${id}`)
        .then(() => fetchMessages())
        .catch((err) => console.error(err));
    }
  };

  return (
    <div>
      
      <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">
        <header className="bg-[#CC0000] text-white pl-5 h-[50px] flex items-center">
          <h1 className="text-2xl font-semibold">Messages</h1>
        </header>

        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          {/* Message List */}
          <div className="border border-gray-300 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#CC0000] text-white">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Message</th>
                  <th className="p-3">Sent At</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center p-4">
                      Loading…
                    </td>
                  </tr>
                ) : messages.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-4">
                      No messages found.
                    </td>
                  </tr>
                ) : (
                  messages.map((msg, index) => (
                    <tr
                      key={msg._id}
                      className="border-b hover:bg-gray-50 duration-150"
                    >
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">{msg.name}</td>
                      <td className="p-3">{msg.email}</td>
                      <td className="p-3">{msg.content}</td>
                      <td className="p-3">
                        {new Date(msg.created_at).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminMessages;
