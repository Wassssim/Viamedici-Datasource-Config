import logger from '../helpers/logger';

const router = require('express').Router();
const elasticsearchService = require('../services/elasticsearchService');

// Get list of Elasticsearch indices
router.get('/indices', async (req, res) => {
  try {
    const indices = await elasticsearchService.getIndices();
    res.json(indices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get documents from a specific index
router.get('/:index', async (req, res) => {
  try {
    const { index } = req.params;
    const documents = await elasticsearchService.getDocuments(index);
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new document to an index
router.post('/:index', async (req, res) => {
  try {
    const { index } = req.params;
    const document = req.body;
    const response = await elasticsearchService.addDocument(index, document);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an existing document
router.put('/:index/:id', async (req, res) => {
  try {
    // TODO: validation
    const { index, id } = req.params;

    const updatedData = req.body;
    console.log(req.body);
    const response = await elasticsearchService.updateDocument(
      index,
      id,
      updatedData
    );
    console.log(response);

    res.json(response);
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

// Delete a document
router.delete('/:index/:id', async (req, res) => {
  try {
    const { index, id } = req.params;
    const response = await elasticsearchService.deleteDocument(index, id);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
