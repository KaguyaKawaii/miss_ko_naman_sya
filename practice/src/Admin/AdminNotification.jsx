import yelanPicture from "../assets/yelanpicture.png";

function AdminNotification() {
  return (
    <div className="ml-[250px] w-[calc(100%-250px)] h-screen relative flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm overflow-hidden">
      {/* Centered Maintenance Message */}
      <div className="text-center max-w-md z-10 px-4">
        {/* Warning Icon */}
        <div className="flex justify-center items-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#CC0000"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-pulse"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Under Maintenance
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6 leading-relaxed">
"The system is temporarily unavailable due to scheduled maintenance by the admin."   
     </p>

        {/* Status Note */}
        <div className="inline-flex items-center bg-amber-50 text-amber-800 px-6 py-2 rounded-full text-md font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          de joke lang hindi to maintenance, rest day ko kasi hehe
        </div>
      </div>

      {/* Yelan Pictures - Bottom Right */}
      <div className="absolute bottom-0 flex">
        <img
          src={yelanPicture}
          alt="Yelan 1"
          className="w-[50rem] h-[50rem] object-contain"
        />
        <img
  src={yelanPicture}
  alt="Yelan 2"
  className="w-[50rem] h-[50rem] object-contain scale-x-[-1]"
/>

      </div>
    </div>
  );
}

export default AdminNotification;
