const express =require('express');
const router = express.Router();
const {createClient, getClients} =require('../controllers/clientController');
const {authenticate, authorize } =require('../middleware/auth');

router.post('/clients', authenticate, authorize('admin'),createClient);

router.get('/clients', authenticate, authorize('admin','team_member'),getClients );
module.exports = router;
