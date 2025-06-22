import React, { useState, useEffect } from "react";
import axios from "axios";
import { Eye, RefreshCcw, Search } from "lucide-react";
import StaffNavigation from "./StaffNavigation";

function StaffReservations({ setView, staff }) {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [modalRes, setModalRes] = useState(null);

  const formatPHDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-PH", {
          timeZone: "Asia/Manila",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "—";

  const formatPHDateTime = (date) =>
    date
      ? new Date(date).toLocaleString("en-PH", {
          timeZone: "Asia/Manila",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "—";

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = () => {
    setIsLoading(true);
    axios
      .get("http://localhost:5000/reservations")
      .then((res) => {
        const sorted = res.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setReservations(sorted);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  const handleApprove = (id) => {
    axios
      .put(`http://localhost:5000/reservations/${id}`, { status: "Approved" })
      .then(() => {
        fetchReservations();
        setModalRes(null);
      })
      .catch((err) => console.error(err));
  };

  const filtered = reservations.filter((r) => {
    const matchesStatus = filter === "All" || r.status === filter;
    const txt = `${r.userId?.name || ""} ${r.roomName || ""} ${r.location || ""}`.toLowerCase();
    const matchesSearch = txt.includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <StaffNavigation
        setView={setView}
        staff={staff}
        currentView="staffReservation"
      />

      <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">
        <header className="bg-[#CC0000] text-white pl-5 h-[50px] flex items-center">
          <h1 className="text-2xl font-semibold">Reservations</h1>
        </header>

        <div className="p-6 flex items-center gap-3 flex-wrap">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchReservations();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, room, location…"
                className="border border-gray-300 p-2 pr-10 rounded-lg w-64"
              />
              <Search
                size={16}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <button
              type="button"
              onClick={fetchReservations}
              className="bg-[#CC0000] text-white p-2 rounded-lg hover:bg-[#990000]"
            >
              <RefreshCcw size={16} />
            </button>
          </form>
        </div>

        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          <div className="border border-gray-300 rounded-xl overflow-hidden">
            <table className="w-full text-sm text-center">
              <thead className="bg-[#CC0000] text-white">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Room</th>
                  <th className="p-3">Reserved By</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created</th>
                  <th className="p-3">View</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="p-4">Loading…</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-4">No reservations found.</td>
                  </tr>
                ) : (
                  filtered.map((r, i) => {
                    const start = new Date(r.datetime);
                    const end   = new Date(start.getTime() + 2 * 60 * 60 * 1000);

                    const dateOnly = formatPHDate(r.datetime);
                    const startStr = start.toLocaleTimeString("en-PH", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                      timeZone: "Asia/Manila",
                    });
                    const endStr = end.toLocaleTimeString("en-PH", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                      timeZone: "Asia/Manila",
                    });

                    return (
                      <tr key={r._id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{i + 1}</td>
                        <td className="p-3">{dateOnly}</td>
                        <td className="p-3">{startStr} — {endStr}</td>
                        <td className="p-3">{r.roomName}<br />{r.location}</td>
                        <td className="p-3">{r.userId?.name}</td>
                        <td className="p-3">
                          <span
                            className={`font-semibold ${
                              r.status === "Approved"
                                ? "text-green-600"
                                : r.status === "Pending"
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3">{formatPHDateTime(r.created_at)}</td>
                        <td className="p-3">
                          <Eye
                            size={18}
                            className="cursor-pointer text-blue-600 hover:text-blue-800"
                            onClick={() => setModalRes(r)}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {modalRes && (
        <ReservationModal
          reservation={modalRes}
          formatPHDate={formatPHDate}
          formatPHDateTime={formatPHDateTime}
          onClose={() => setModalRes(null)}
          onApprove={handleApprove}
        />
      )}
    </>
  );
}

function ReservationModal({ reservation, formatPHDate, formatPHDateTime, onClose, onApprove }) {
  const {
    _id,
    userId,
    roomName,
    location,
    datetime,
    numUsers,
    purpose,
    participants = [],
    status,
    created_at,
  } = reservation;

  const startDate = new Date(datetime);
  const endDate   = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  const startTime = startDate.toLocaleTimeString("en-PH", {
    timeZone: "Asia/Manila",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const endTime = endDate.toLocaleTimeString("en-PH", {
    timeZone: "Asia/Manila",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[500px] max-h-[90vh] rounded-xl shadow-xl overflow-y-auto">
        <header className="flex justify-between items-center bg-[#CC0000] text-white px-5 py-3 rounded-t-xl">
          <h2 className="text-lg font-semibold">Reservation Details</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
        </header>

        <div className="p-6 space-y-3 text-sm">
          <p><strong>Reserved By:</strong> {userId?.name}</p>
          <p><strong>Email:</strong> {userId?.email}</p>
          <p><strong>Room:</strong> {roomName} @ {location}</p>
          <p><strong>Reserved Date:</strong> {formatPHDate(datetime)}</p>
          <p><strong>Time:</strong> {startTime} — {endTime}</p>
          <p><strong>Number of Users:</strong> {numUsers}</p>
          <p><strong>Purpose:</strong> {purpose}</p>
          <p><strong>Status:</strong> {status}</p>
          <p><strong>Created At:</strong> {formatPHDateTime(created_at)}</p>

          {participants.length > 0 && (
            <div>
              <p className="font-semibold">Participants:</p>
              <ul className="list-disc list-inside space-y-1">
                {participants.map((p, idx) => (
                  <li key={idx}>
                    {p.name} — {p.courseYear}, {p.department} ({p.idNumber})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-5 flex justify-between gap-2">
          {status === "Pending" && (
            <button
              onClick={() => onApprove(_id)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Approve
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default StaffReservations;
