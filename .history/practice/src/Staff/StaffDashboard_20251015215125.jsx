{/* Enhanced Stats Section */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  {/* Reservations Card */}
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-gray-500 text-sm font-medium mb-2">
          Total Reservations
        </p>
        <div className="flex items-baseline gap-2 mb-2">
          <p className="text-3xl font-bold text-gray-800">
            {reservations.length}
          </p>
          {summaryData.pendingReservations > 0 && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
              +{summaryData.pendingReservations} pending
            </span>
          )}
        </div>
        {staff?.floor && (
          <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
            <CalendarIcon size={14} className="text-blue-500" />
            <span className="font-medium">Floor:</span>
            <span className="text-red-600 font-semibold">
              {normalizeFloorName(staff.floor)}
            </span>
          </div>
        )}
      </div>
      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
        <CalendarIcon size={24} />
      </div>
    </div>
    <div className="mt-4 pt-3 border-t border-gray-100">
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500">
          {summaryData.pendingReservations === 0 ? (
            "All reservations processed"
          ) : (
            <>
              <span className="font-semibold text-yellow-600">
                {summaryData.pendingReservations}
              </span>{" "}
              need approval
            </>
          )}
        </p>
        {summaryData.pendingReservations > 0 && (
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        )}
      </div>
    </div>
  </div>

  {/* Users Card */}
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-2">Active Users</p>
        <p className="text-3xl font-bold text-gray-800 mb-2">
          {summaryData.users}
        </p>
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Users size={12} />
          <span>Verified users on floor</span>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
        <Users size={24} />
      </div>
    </div>
    <div className="mt-4 pt-3 border-t border-gray-100">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Unique users with reservations
        </p>
        <div className={`w-2 h-2 rounded-full ${
          summaryData.users > 0 ? 'bg-green-500' : 'bg-gray-300'
        }`}></div>
      </div>
    </div>
  </div>

  {/* Notifications Card */}
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-2">
          Notifications
        </p>
        <div className="flex items-baseline gap-2 mb-2">
          <p className="text-3xl font-bold text-gray-800">
            {summaryData.notifications}
          </p>
          {summaryData.notifications > 0 && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
              Action needed
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600">
          Pending reservations
        </p>
      </div>
      <div className={`p-3 rounded-xl shadow-lg ${
        summaryData.notifications > 0 
          ? 'bg-gradient-to-br from-red-500 to-red-600 animate-pulse' 
          : 'bg-gradient-to-br from-purple-500 to-purple-600'
      } text-white`}>
        <Bell size={24} />
      </div>
    </div>
    <div className="mt-4 pt-3 border-t border-gray-100">
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500">
          {summaryData.notifications === 0 ? (
            "All clear!"
          ) : (
            "Requires your attention"
          )}
        </p>
        {summaryData.notifications > 0 && (
          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
        )}
      </div>
    </div>
  </div>

  {/* Messages Card */}
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-2">
          Messages
        </p>
        <div className="flex items-baseline gap-2 mb-2">
          <p className="text-3xl font-bold text-gray-800">
            {summaryData.messages}
          </p>
          {summaryData.messages > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
              Unread
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600">
          From floor users
        </p>
      </div>
      <div className={`p-3 rounded-xl shadow-lg ${
        summaryData.messages > 0 
          ? 'bg-gradient-to-br from-amber-500 to-amber-600' 
          : 'bg-gradient-to-br from-gray-500 to-gray-600'
      } text-white`}>
        <MessageSquare size={24} />
      </div>
    </div>
    <div className="mt-4 pt-3 border-t border-gray-100">
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500">
          {summaryData.messages === 0 ? (
            "No new messages"
          ) : (
            "Unread messages waiting"
          )}
        </p>
        {summaryData.messages > 0 && (
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        )}
      </div>
    </div>
  </div>
</div>