const router = require('express').Router();
const { generateToken } = require('../controllers/videoController');

router.get('/token/:userId', generateToken);

module.exports = router;