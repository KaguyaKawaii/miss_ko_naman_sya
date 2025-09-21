// services/reservationService.js


const Reservation = require("../models/Reservation");
const User = require("../models/User");


// Check if user exceeded weekly reservation limit (2 days max)
exports.checkWeeklyLimit = async (userId, datetime) => {
const startOfWeek = new Date(datetime);
const day = startOfWeek.getDay();
const diffToMonday = (day === 0 ? -6 : 1) - day;
startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
startOfWeek.setHours(0, 0, 0, 0);
const endOfWeek = new Date(startOfWeek);
endOfWeek.setDate(endOfWeek.getDate() + 6);
endOfWeek.setHours(23, 59, 59, 999);


const weeklyReservations = await Reservation.find({
userId,
datetime: { $gte: startOfWeek, $lte: endOfWeek },
status: { $in: ["Pending", "Approved", "Ongoing"] },
});


const reservedDays = new Set(weeklyReservations.map(r => new Date(r.datetime).toDateString()));
return reservedDays;
};


// Check if participants have time conflicts
exports.checkParticipantConflicts = async (participants, parsedDatetime, endDatetime) => {
for (const participant of participants) {
const participantUser = await User.findOne({ id_number: participant.idNumber });
if (!participantUser) throw new Error(`Participant with ID ${participant.idNumber} not found.`);
if (!participantUser.verified) throw new Error(`Participant ${participantUser.name} is not verified.`);


const conflicts = await Reservation.find({
$or: [{ userId: participantUser._id }, { "participants.idNumber": participantUser.id_number }],
datetime: { $lt: endDatetime },
endDatetime: { $gt: parsedDatetime },
status: { $in: ["Pending", "Approved", "Ongoing"] },
});


if (conflicts.length > 0) {
throw new Error(`Participant ${participantUser.name} has a conflicting reservation during this time.`);
}
}
};


// Utility to enrich participants with details
exports.enrichParticipants = async (participants) => {
const enriched = [];
for (const participant of participants) {
const participantUser = await User.findOne({ id_number: participant.idNumber });
enriched.push({
idNumber: participantUser.id_number,
name: participantUser.name,
course: participantUser.course || "N/A",
year_level: participantUser.yearLevel || "N/A",
department: participantUser.department || "N/A",
});
}
return enriched;
};