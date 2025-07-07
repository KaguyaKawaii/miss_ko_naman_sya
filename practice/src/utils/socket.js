import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // ✅ Correct
export default socket;
