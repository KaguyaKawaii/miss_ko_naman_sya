// debugExports.js
const reservationController = require('./controllers/reservationController');

console.log('🔍 Checking reservationController exports:');
console.log('Type of module:', typeof reservationController);
console.log('Available methods:');

Object.keys(reservationController).forEach(key => {
  console.log(`- ${key}: ${typeof reservationController[key]}`);
});

console.log('\n🔍 Specific methods we need:');
console.log('getReservationParticipants:', typeof reservationController.getReservationParticipants);
console.log('addParticipant:', typeof reservationController.addParticipant);
console.log('removeParticipant:', typeof reservationController.removeParticipant);

// Test if they're functions
if (typeof reservationController.getReservationParticipants !== 'function') {
  console.log('❌ getReservationParticipants is NOT a function!');
}
if (typeof reservationController.addParticipant !== 'function') {
  console.log('❌ addParticipant is NOT a function!');
}
if (typeof reservationController.removeParticipant !== 'function') {
  console.log('❌ removeParticipant is NOT a function!');
}