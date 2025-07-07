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
    <>
      <AdminNavigation setView={setView} currentView="adminNews" />
      <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gray-50">
        <header className="bg-white px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-[#CC0000]">News Management</h1>
          <p className="text-gray-600">Add and manage news announcements</p>
        </header>
        
        <div className="p-6">
          {/* Add News Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
            <h2 className="text-xl font-semibold mb-4">Add News</h2>
            <form onSubmit={handleAddNews} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Title"
                className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                placeholder="Content"
                className="border border-gray-300 p-2 rounded h-28 resize-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <button
                type="submit"
                className="bg-[#CC0000] text-white px-5 py-2 rounded hover:bg-red-700 duration-150 self-end"
              >
                Post News
              </button>
            </form>
          </div>

          {/* News List */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">News List</h2>
            {isLoading ? (
              <div className="text-center p-4">Loading...</div>
            ) : newsList.length === 0 ? (
              <div className="text-center p-4 text-gray-500">No news posted.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left">#</th>
                      <th className="p-3 text-left">Title</th>
                      <th className="p-3 text-left">Content</th>
                      <th className="p-3 text-left">Posted</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newsList.map((item, index) => (
                      <tr
                        key={item._id}
                        className="border-b border-gray-200 hover:bg-gray-50 duration-150"
                      >
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3 font-medium">{item.title}</td>
                        <td className="p-3">{item.content}</td>
                        <td className="p-3">
                          {new Date(item.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleDeleteNews(item._id)}
                            className="text-[#CC0000] hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default AdminNews;