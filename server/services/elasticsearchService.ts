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

const getDocuments = async (
  index,
  searchString?: string,
  page = 1,
  size = 10
) => {
  const from = (page - 1) * size; // Calculate offset

  const { body } = await esClient.search({
    index,
    from,
    size,
    body: {
      query: searchString
        ? {
            query_string: {
              query: `*${searchString}*`, // Wildcard search
              fields: ['*'], // Search across all fields
              default_operator: 'AND',
            },
          }
        : { match_all: {} }, // If no searchString, return all docs
    },
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
