const express = require('express');
const { createTwin, postFeatures, printDocument } = require('../controllers/twinController');
const router = express.Router();

router.post('/twins', createTwin);
router.post('/twins/:twinId/features', postFeatures);
router.get('/twins/:twinId/print', printDocument);

module.exports = router;
