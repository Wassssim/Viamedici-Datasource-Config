import PropertiesFileService from '../services/propertiesFileService';
import logger from '../helpers/logger';

const propertiesFileService = new PropertiesFileService();
const router = require('express').Router();

// Get list of Elasticsearch indices
router.get('/:sourceId/parsed', async (req, res) => {
  try {
    const data = propertiesFileService.parseFile(req.params.sourceId);
    res.json({ data });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:sourceId', async (req, res) => {
  try {
    propertiesFileService.updatePropertiesFile(
      req.body.data,
      req.params.sourceId
    );
    res.json();
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
