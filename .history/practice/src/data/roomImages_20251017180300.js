// Shared room images configuration - used by both AdminRooms and ReserveRoom
import DiscussionRoom1 from "../assets/1st_Floor/Discussion/Discussion_Room_1.jpg";
import DiscussionRoom2 from "../assets/1st_Floor/Discussion/Discussion_Room_2.jpg";
import DiscussionRoom3 from "../assets/1st_Floor/Discussion/Discussion_Room_3.jpg";
import GraduateHub1 from "../assets/1st_Floor/Graduate/Graduate_Research_Hub_1.jpg";
import GraduateHub2 from "../assets/1st_Floor/Graduate/Graduate_Research_Hub_2.jpg";
import GraduateHub3 from "../assets/1st_Floor/Graduate/Graduate_Research_Hub_3.jpg";
import GroundFloorImg from "../assets/GroundFloor.jpg";
import FifthFloorImg from "../assets/picture2.jpg";
import FacultyRoomImg from "../assets/FacultyRoom.jpg";
import CollabRoomImg from "../assets/CollabRoom.jpg";

export const availableRoomImages = [
  // Discussion Rooms
  { id: "discussion_room_1", name: "Discussion Room 1", url: DiscussionRoom1, category: "Discussion" },
  { id: "discussion_room_2", name: "Discussion Room 2", url: DiscussionRoom2, category: "Discussion" },
  { id: "discussion_room_3", name: "Discussion Room 3", url: DiscussionRoom3, category: "Discussion" },
  
  // Graduate Research Hubs
  { id: "graduate_hub_1", name: "Graduate Research Hub 1", url: GraduateHub1, category: "Graduate" },
  { id: "graduate_hub_2", name: "Graduate Research Hub 2", url: GraduateHub2, category: "Graduate" },
  { id: "graduate_hub_3", name: "Graduate Research Hub 3", url: GraduateHub3, category: "Graduate" },
  
  // Floor Images
  { id: "ground_floor", name: "Ground Floor", url: GroundFloorImg, category: "Floor" },
  { id: "fifth_floor", name: "Fifth Floor", url: FifthFloorImg, category: "Floor" },
  { id: "faculty_room", name: "Faculty Room", url: FacultyRoomImg, category: "Special" },
  { id: "collab_room", name: "Collaboration Room", url: CollabRoomImg, category: "Special" },
];

// Helper function to get image by ID
export const getRoomImageById = (imageId) => {
  return availableRoomImages.find(img => img.id === imageId);
};

// Helper function to get image by URL (for backward compatibility)
export const getRoomImageByUrl = (imageUrl) => {
  return availableRoomImages.find(img => img.url === imageUrl);
};