import { ElasticsearchConfig } from '../types/data-source-config';
import { getConfig } from './configService';

const { Client } = require('@elastic/elasticsearch');

const config = getConfig();
const selectedConfig = config.sourcesConfig[
  config.selectedSource
] as ElasticsearchConfig;

const esClient = new Client({
  node: `${selectedConfig.protocol}://${selectedConfig.host}:${selectedConfig.port}`,
});

const getIndices = async () => {
  const { body } = await esClient.cat.indices({ format: 'json' });
  return body.map((index) => index.index);
};

const getIndexSchema = async (index) => {
  try {
    const { body } = await esClient.indices.getMapping({ index });

    return body[index].mappings.properties;
  } catch (error) {
    console.error(`Error fetching schema for index "${index}":`, error);
    throw error;
  }
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
  return body.hits.hits.map((doc) => ({ _id: doc._id, ...doc._source }));
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

const isIndexAccessible = (index: string) =>
  selectedConfig.indices.some((pattern) => {
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`, 'i');
    return regex.test(index);
  });

module.exports = {
  getIndices,
  getIndexSchema,
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  isIndexAccessible,
};
