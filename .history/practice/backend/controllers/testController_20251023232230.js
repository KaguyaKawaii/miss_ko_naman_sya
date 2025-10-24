// controllers/testController.js
exports.getReservationParticipants = async (req, res) => {
  console.log('✅ Test controller - getReservationParticipants called');
  res.json({ 
    success: true, 
    message: 'Test endpoint working',
    participants: []
  });
};

exports.addParticipant = async (req, res) => {
  console.log('✅ Test controller - addParticipant called');
  res.json({ 
    success: true, 
    message: 'Add participant test working'
  });
};

exports.removeParticipant = async (req, res) => {
  console.log('✅ Test controller - removeParticipant called');
  res.json({ 
    success: true, 
    message: 'Remove participant test working'
  });
};