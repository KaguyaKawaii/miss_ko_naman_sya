import React, { useState } from "react";
import axios from "axios";

function ConfirmDeleteModal({ user, onClose, onSuccess }) {
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  const confirmAndDelete = async () => {
    if (confirmation !== "DELETE") {
      setError('You must type "DELETE" to confirm.');
      return;
    }
    setWorking(true);
    try {
      const endpoint = `http://localhost:5000/api/users/${user._id}`;
      await axios.delete(endpoint);
      onSuccess();
    } catch (err) {
      setError("Server error while deleting.");
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-[400px]">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 text-center">
          Delete User
        </h3>

        <p className="text-sm text-gray-700 mb-5 leading-relaxed">
          Are you sure you want to delete <strong>{user.name}</strong>?<br />
          Please type <strong>DELETE</strong> below to confirm.
        </p>

        <input
          type="text"
          placeholder='Type "DELETE"'
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          className="border border-gray-300 w-full p-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <div className="flex justify-end gap-3 pt-1">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-150 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={confirmAndDelete}
            disabled={working}
            className="px-5 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-red-600 transition duration-150 disabled:opacity-60 cursor-pointer"
          >
            {working ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;
