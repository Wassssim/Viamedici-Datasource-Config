const { Client } = require('@elastic/elasticsearch');

const ELASTICSEARCH_HOST = process.env.ELASTICSEARCH_HOST || 'http://localhost';
const ELASTICSEARCH_PORT = process.env.ELASTICSEARCH_PORT || 9200;

const esClient = new Client({
  node: `${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}`,
});

const getIndices = async () => {
  const { body } = await esClient.cat.indices({ format: 'json' });
  return body.map((index) => index.index);
};

const getDocuments = async (index) => {
  const { body } = await esClient.search({
    index,
    size: 10,
    body: { query: { match_all: {} } },
  });
  return body.hits.hits.map((doc) => ({ id: doc._id, ...doc._source }));
};

const addDocument = async (index, document) => {
  const { body } = await esClient.index({
    index,
    body: document,
    refresh: true,
  });
  return body;
};

const updateDocument = async (index, id, updatedData) => {
  const { body } = await esClient.update({
    index,
    id,
    body: { doc: updatedData },
    refresh: true,
  });
  return body;
};

const deleteDocument = async (index, id) => {
  const { body } = await esClient.delete({
    index,
    id,
    refresh: true,
  });
  return body;
};

module.exports = {
  getIndices,
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
};
