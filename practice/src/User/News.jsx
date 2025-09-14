import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";

function News({ user, setView }) {
  const [newsList, setNewsList] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); // For fullscreen image
  const NEWS_ENDPOINT = "http://localhost:5000/news"; // Adjust if needed

  const formatPH = (date) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleString("en-PH", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  const fetchNews = async () => {
    try {
      const { data } = await axios.get(NEWS_ENDPOINT);
      setNewsList(data);
    } catch (error) {
      console.error("Failed to fetch news:", error);
      setNewsList([]);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <main className="w-full md:ml-[250px] md:w-[calc(100%-250px)] min-h-screen flex flex-col bg-[#FFFCFB]">
      {/* Header */}
      <header className="text-black px-6 h-[60px] flex items-center justify-between shadow-sm">
        <h1 className="text-xl md:text-2xl font-bold tracking-wide">News</h1>
      </header>

      {/* Tab Switcher */}
      <div className="flex w-[200px] justify-between bg-white shadow-md p-1 rounded-3xl mt-6 ml-6">
        <button
          onClick={() => setView("dashboard")}
          className="px-4 py-2 rounded-3xl font-semibold transition-all duration-300 text-gray-700 hover:bg-gray-200 cursor-pointer"
        >
          Dashboard
        </button>
        <button
          onClick={() => setView("news")}
          className="px-4 py-2 rounded-3xl font-semibold transition-all duration-300 bg-red-600 text-white"
        >
          News
        </button>
      </div>

      {/* News Content */}
      <div className="flex justify-center p-6">
        <div className="space-y-4 max-h-[calc(100vh-200px)] pr-2 w-full max-w-6xl">
          {!newsList || newsList.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No announcements available at this time.
              </p>
            </div>
          ) : (
            newsList.map((n) => (
              <article
                key={n._id}
                className="p-4 border border-gray-100 rounded-lg hover:shadow transition-shadow bg-white"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3">
  <div className="flex items-center gap-3 mb-2 md:mb-0">
    {/* Circle with Admin SVG */}
    <div className="flex items-center justify-center border border-gray-500 rounded-full w-[50px] h-[50px] bg-yellow-300">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 text-gray-700"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5.121 17.804A9.003 9.003 0 0112 15c2.21 0 4.21.804 5.879 2.137M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    </div>
    <h1 className="font-bold">USA-FLD Admin</h1>
  </div>
  
  <time className="text-xs text-gray-500 flex items-center gap-1">
    {formatPH(n.createdAt)}
  </time>
</div>

                {/* Show Full Image */}
                {n.image && (
                  <div className="mb-3">
                    <img
                      src={n.image}
                      alt={n.title}
                      className="w-full rounded-lg object-contain cursor-pointer"
                      style={{ maxHeight: "600px" }} // Adjust max height
                      onClick={() => setSelectedImage(n.image)}
                    />
                  </div>
                )}

                <div className="border-b border-gray-100 mb-3" />
                <h2 className="font-bold text-gray-800 text-lg">{n.title}</h2>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {n.content}
                </p>
              </article>
            ))
          )}
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {selectedImage && (
        <div
  className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
  onClick={() => setSelectedImage(null)}
>

          <img
            src={selectedImage}
            alt="Full view"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </main>
  );
}

News.propTypes = {
  user: PropTypes.object,
  setView: PropTypes.func.isRequired,
};

export default News;
