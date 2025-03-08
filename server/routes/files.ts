import logger from '../helpers/logger';

const propertiesFileService = require('../services/propertiesFileService');
const router = require('express').Router();

// Get list of Elasticsearch indices
router.get('/parsed', async (req, res) => {
  try {
    const data = propertiesFileService.parseFile();
    res.json({ data });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/', async (req, res) => {
  try {
    propertiesFileService.updatePropertiesFile(req.body.data);
    res.json();
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
