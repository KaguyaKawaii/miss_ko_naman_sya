import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminNavigation from "./AdminNavigation";

function AdminNews({ setView }) {
  const [newsList, setNewsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = () => {
    setIsLoading(true);
    axios
      .get("http://localhost:5000/news")
      .then((res) => setNewsList(res.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  const handleAddNews = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return alert("Please complete the form");

    axios
      .post("http://localhost:5000/news", { title, content })
      .then(() => {
        fetchNews();
        setTitle("");
        setContent("");
      })
      .catch((err) => console.error(err));
  };

  const handleDeleteNews = (id) => {
    if (window.confirm("Are you sure you want to delete this news item?")) {
      axios
        .delete(`http://localhost:5000/news/${id}`)
        .then(() => fetchNews())
        .catch((err) => console.error(err));
    }
  };

  return (
    <div>
      <AdminNavigation setView={setView} currentView="adminNews" />
      <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">
        <header className="bg-[#CC0000] text-white pl-5 h-[50px] flex items-center">
          <h1 className="text-2xl font-semibold">News Management</h1>
        </header>

        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          {/* Add News Form */}
          <form
            onSubmit={handleAddNews}
            className="flex flex-col gap-3 border border-gray-300 p-5 rounded-xl bg-white"
          >
            <h2 className="text-xl font-semibold">Add News</h2>
            <input
              type="text"
              placeholder="Title"
              className="border p-2 rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="Content"
              className="border p-2 rounded h-28 resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button
              type="submit"
              className="bg-[#CC0000] text-white px-5 py-2 rounded hover:bg-red-700 duration-150"
            >
              Post News
            </button>
          </form>

          {/* News List */}
          <div className="border border-gray-300 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#CC0000] text-white">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Content</th>
                  <th className="p-3">Posted</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="text-center p-4">
                      Loading…
                    </td>
                  </tr>
                ) : newsList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center p-4">
                      No news posted.
                    </td>
                  </tr>
                ) : (
                  newsList.map((item, index) => (
                    <tr
                      key={item._id}
                      className="border-b hover:bg-gray-50 duration-150"
                    >
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3 font-medium">{item.title}</td>
                      <td className="p-3">{item.content}</td>
                      <td className="p-3">
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteNews(item._id)}
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

export default AdminNews;
