// src/pages/staff/StaffDashboard.jsx
import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle,
  AlertCircle,
  MessageSquare,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  helpers – simple card component                                   */
/* ------------------------------------------------------------------ */
const StatCard = ({ icon, label, value, bg = "bg-[#F2F2F2]" }) => (
  <div
    className={`flex items-center gap-4 p-5 rounded-[14px] shadow-sm ${bg}`}
  >
    {icon}
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  </div>
);

function StaffDashboard() {
  /* ------------------------------------------------------------------ */
  /*  local state                                                       */
  /* ------------------------------------------------------------------ */
  const [stats, setStats] = useState({
    todayReservations: 0,
    pendingReservations: 0,
    approvedToday: 0,
    unreadMessages: 0,
  });
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ------------------------------------------------------------------ */
  /*  fetch summary + latest pending reservations                       */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    async function fetchData() {
      try {
        /* Replace these endpoints with your own --------------------- */
        const resSummary = await fetch("/api/staff/dashboard/summary");
        const resPending = await fetch(
          "/api/staff/reservations?status=pending&limit=5"
        );
        const summaryData = await resSummary.json();
        const pendingData = await resPending.json();

        /* ----------------------------------------------------------- */
        setStats({
          todayReservations: summaryData.todayReservations,
          pendingReservations: summaryData.pendingReservations,
          approvedToday: summaryData.approvedToday,
          unreadMessages: summaryData.unreadMessages,
        });
        setPendingList(pendingData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  /* ------------------------------------------------------------------ */
  /*  UI                                                                */
  /* ------------------------------------------------------------------ */
  return (

    <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">

      <header className="bg-[#CC0000] text-white pl-5 h-[50px] flex items-center">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
        </header>

    <section className="p-8"> {/* left margin = sidebar width */}
        
      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<CalendarDays size={28} className="text-[#CC0000]" />}
          label="Reservations Today"
          value={stats.todayReservations}
        />
        <StatCard
          icon={<AlertCircle size={28} className="text-[#CC0000]" />}
          label="Pending Approval"
          value={stats.pendingReservations}
          bg="bg-[#FFF7F7]"
        />
        <StatCard
          icon={<CheckCircle size={28} className="text-[#00A859]" />}
          label="Approved Today"
          value={stats.approvedToday}
        />
        <StatCard
          icon={<MessageSquare size={28} className="text-[#CC0000]" />}
          label="Unread Messages"
          value={stats.unreadMessages}
        />
      </div>

      {/* PENDING RESERVATIONS TABLE */}
      <div className="bg-white shadow-sm rounded-[14px] p-6">
        <h2 className="text-xl font-semibold mb-4">Latest Pending Reservations</h2>
        {loading ? (
          <p className="text-gray-600">Loading…</p>
        ) : pendingList.length === 0 ? (
          <p className="text-gray-600">No pending reservations 🎉</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#FAF9F6]">
                <tr>
                  <th className="px-4 py-2 text-left">Date &amp; Time</th>
                  <th className="px-4 py-2 text-left">Room</th>
                  <th className="px-4 py-2 text-left">Requested By</th>
                  <th className="px-4 py-2 text-left">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {pendingList.map((r) => (
                  <tr key={r._id} className="border-t">
                    <td className="px-4 py-2">
                      {new Date(r.datetime).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">{r.roomName}</td>
                    <td className="px-4 py-2">{r.requesterName}</td>
                    <td className="px-4 py-2">{r.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
    </main>
  );
}

export default StaffDashboard;
