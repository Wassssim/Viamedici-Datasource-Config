import express from 'express';
import { getConfig } from '../services/configService';

const router = express.Router();

router.get('/', (req, res) => {
  const config = getConfig();
  if (!config) {
    // TODO: use logging
    return res.status(500).json({ error: 'Configuration not available' });
  }
  res.json({ selectedSource: config.selectedSource });
});

module.exports = router;
