import { convertElasticsearchMappings } from '../types/type-mapper';
import ElasticsearchService from '../services/elasticsearchService';
import logger from '../helpers/logger';

const router = require('express').Router();
const elasticsearchService = new ElasticsearchService();

// Get list of Elasticsearch indices
router.get('/:sourceId/indices', async (req, res) => {
  try {
    const indices = await elasticsearchService.getIndices(req.params.sourceId);

    const fileteredIndices = indices.filter((esIndex) =>
      elasticsearchService.isIndexAccessible(req.params.sourceId, esIndex)
    );

    res.json(fileteredIndices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:sourceId/:index/schema', async (req, res) => {
  try {
    const mappings = await elasticsearchService.getIndexMappings(
      req.params.sourceId,
      req.params.index
    );

    //console.log(JSON.stringify(mappings.properties, null, 4));

    res.json({
      convertedSchema: convertElasticsearchMappings(mappings.properties),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get documents from a specific index
router.get('/:sourceId/:index', async (req, res) => {
  try {
    const { index } = req.params;
    const { searchString, page, pageSize, fields } = req.query;
    const fieldList = fields ? fields.split(',') : [];

    const documents = await elasticsearchService.getDocuments(
      req.params.sourceId,
      index,
      searchString,
      fieldList,
      page,
      pageSize
    );

    if (documents === false) {
      res
        .status(400)
        .json({ message: 'query string does not match selected field types' });
    } else {
      res.json(documents);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:sourceId/:index/:documentId', async (req, res) => {
  try {
    const { sourceId, index, documentId } = req.params;
    const { truncate } = req.query;
    const document = await elasticsearchService.getDocumentById(
      sourceId,
      index,
      documentId,
      truncate == 1
    );
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new document to an index
router.post('/:sourceId/:index', async (req, res) => {
  try {
    const { index } = req.params;
    const document = req.body;
    const response = await elasticsearchService.addDocument(
      req.params.sourceId,
      index,
      document
    );
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an existing document
router.put('/:sourceId/:index/:id', async (req, res) => {
  try {
    // TODO: validation
    const { index, id } = req.params;

    const updatedData = req.body;
    const response = await elasticsearchService.updateDocument(
      req.params.sourceId,
      index,
      id,
      updatedData
    );

    res.json({ message: 'Document updated successfully' });
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

// Delete a document
router.delete('/:sourceId/:index/:id', async (req, res) => {
  try {
    const { index, id } = req.params;
    const response = await elasticsearchService.deleteDocument(
      req.params.sourceId,
      index,
      id
    );
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
