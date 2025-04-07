const { AccessToken } = require('livekit-server-sdk');

const createToken = (userId, roomName) => {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  
  const at = new AccessToken(apiKey, apiSecret, {
    identity: userId,
    name: `User-${userId}`
  });

  // Grant permissions for the room
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  return at.toJwt();
};

exports.generateToken = async (req, res) => {
  try {
    const { userId } = req.params;
    const roomName = 'skill-sharing-room'; // You can make this dynamic based on your needs
    
    const token = createToken(userId, roomName);
    res.json({ token });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
};