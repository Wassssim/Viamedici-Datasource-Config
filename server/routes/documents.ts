import { convertElasticsearchSchema } from '../types/type-mapper';
import logger from '../helpers/logger';

const router = require('express').Router();
const elasticsearchService = require('../services/elasticsearchService');

// Get list of Elasticsearch indices
router.get('/indices', async (req, res) => {
  try {
    const indices = await elasticsearchService.getIndices();
    const fileteredIndices = indices.filter((index) =>
      elasticsearchService.isIndexAccessible(index)
    );

    res.json(fileteredIndices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:index/schema', async (req, res) => {
  try {
    const schema = await elasticsearchService.getIndexSchema(req.params.index);
    res.json(convertElasticsearchSchema(schema));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get documents from a specific index
router.get('/:index', async (req, res) => {
  try {
    const { index } = req.params;
    const { searchString, page, pageSize } = req.query;
    const documents = await elasticsearchService.getDocuments(
      index,
      searchString,
      page,
      pageSize
    );
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
    const response = await elasticsearchService.updateDocument(
      index,
      id,
      updatedData
    );

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
