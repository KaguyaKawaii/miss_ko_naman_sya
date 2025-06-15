function Profile({ user }) {
  return (
    <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">

  {/* Header */}
  <header className="bg-[#CC0000] text-white pl-5 h-[50px] flex items-center justify-start">
    <h1 className="text-2xl font-semibold">Profile</h1>
  </header>

  {/* Main Content Area with scrollable overflow */}
  <div className="flex-1 overflow-y-auto">
    <div className="m-5 border border-gray-200 rounded-lg p-6 bg-white shadow-md min-h-[calc(100vh-50px)]">
      <h1 className="text-3xl font-semibold text-center">Profile Details</h1>

      <div className="mt-5 flex flex-col items-center justify-center gap-5">
        <div className="border w-[150px] h-[150px] rounded-full bg-white flex items-center justify-center text-5xl text-gray-400 mt-5">
          {user?.name?.charAt(0) || "?"}
        </div>

        <div className="mt-5">
          <p>Full Name</p>
          <div className="border border-gray-200 p-3 w-[450px] rounded-lg shadow-md mb-4">
            <p>{user?.name}</p>
          </div>

          <p>Email</p>
          <div className="border border-gray-200 p-3 w-[450px] rounded-lg shadow-md mb-4">
            <p>{user?.email}</p>
          </div>

          <p>Course</p>
          <div className="border border-gray-200 p-3 w-[450px] rounded-lg shadow-md mb-4">
            <p>{user?.course}</p>
          </div>

          <p>Department</p>
          <div className="border border-gray-200 p-3 w-[450px] rounded-lg shadow-md mb-4">
            <p>{user?.department}</p>
          </div>

          <p>ID Number</p>
          <div className="border border-gray-200 p-3 w-[450px] rounded-lg shadow-md mb-4">
            {user?.id_number && <p>{user.id_number}</p>}
          </div>
        </div>
      </div>
    </div>
  </div>
</main>

  );
}

export default Profile;
