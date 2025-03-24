import { truncateJSON } from '../utils/utils';
import { DataSource, ElasticsearchConfig } from '../types/data-source-config';
import { getConfig } from './configService';
import { flattenElasticsearchMapping } from '../types/type-mapper';

const { Client } = require('@elastic/elasticsearch');

export default class ElasticsearchService {
  private esClients: Map<number, typeof Client>;
  static _instance: ElasticsearchService;

  constructor() {
    if (ElasticsearchService._instance) {
      return ElasticsearchService._instance;
    }
    ElasticsearchService._instance = this;
    this.esClients = new Map();
  }

  getCurrentConfig(sourceId) {
    const config = getConfig();

    return config.sourcesConfig[DataSource.Elasticsearch][
      sourceId
    ] as ElasticsearchConfig;
  }

  private getClient(sourceId: number) {
    if (!this.esClients.has(sourceId)) {
      const config = this.getCurrentConfig(sourceId);
      const client = new Client({
        node: `${config.protocol}://${config.host}:${config.port}`,
      });
      this.esClients.set(sourceId, client);
    }
    return this.esClients.get(sourceId)!;
  }

  async getIndices(sourceId) {
    const esClient = this.getClient(sourceId);
    const { body } = await esClient.cat.indices({ format: 'json' });
    return body.map((index) => index.index);
  }

  async getIndexMappings(sourceId, index) {
    try {
      const esClient = this.getClient(sourceId);
      const { body } = await esClient.indices.getMapping({ index });

      return body[index].mappings;
    } catch (error) {
      console.error(`Error fetching mappings for index "${index}":`, error);
      throw error;
    }
  }

  async getDocumentById(sourceId, index, documentId, truncate = false) {
    const esClient = this.getClient(sourceId);

    try {
      const { body } = await esClient.get({
        index,
        id: documentId,
      });

      if (truncate === true) {
        return {
          _id: body._id,
          truncated: truncateJSON(body._source, 100),
        };
      }

      return { _id: body._id, ...body._source }; // Return document with _id
    } catch (error) {
      if (error.meta && error.meta.statusCode === 404) {
        return null; // Return null if not found
      }
      throw error; // Throw error for other issues
    }
  }

  private async buildGetDocumentsQuery(
    fields: string[],
    queryString,
    sourceId,
    index
  ) {
    const mappings = await this.getIndexMappings(sourceId, index);
    const flattenedMapping = flattenElasticsearchMapping(mappings);

    //console.log(fields, mappings, flattenedMapping);

    const mappedFields = fields.map((field) => {
      const fieldParentPath = field.split('.').slice(0, -1).join('.');
      if (
        field.includes('.') &&
        flattenedMapping[fieldParentPath] === 'nested'
      ) {
        return {
          nested: {
            path: fieldParentPath,
            query: {
              match: { [field]: queryString },
            },
          },
        };
      } else {
        return { match: { [field]: queryString } };
      }
    });

    return {
      bool: {
        should: mappedFields,
        minimum_should_match: 1, // At least one condition must match
      },
    };
  }

  async getDocuments(
    sourceId,
    index,
    searchString?: string,
    fields = null,
    page = 1,
    size = 10
  ) {
    const esClient = this.getClient(sourceId);
    const from = (page - 1) * size; // Calculate offset

    try {
      const { body } = await esClient.search({
        index,
        from,
        size,
        body: {
          query: searchString
            ? await this.buildGetDocumentsQuery(
                fields,
                searchString,
                sourceId,
                index
              )
            : { match_all: {} }, // If no searchString, return all docs
        },
      });

      return body.hits.hits.map((doc) => ({
        _id: doc._id,
        truncated: truncateJSON(doc._source, 100),
      }));
    } catch (e) {
      return false;
    }
  }

  async addDocument(sourceId, index, document) {
    const esClient = this.getClient(sourceId);
    const { body } = await esClient.index({
      index,
      body: document,
      refresh: true,
    });
    return body;
  }

  async updateDocument(sourceId, index, id, updatedData) {
    const esClient = this.getClient(sourceId);
    const { body } = await esClient.update({
      index,
      id,
      body: { doc: updatedData },
      refresh: true,
    });
    return body;
  }

  async deleteDocument(sourceId, index, id) {
    const esClient = this.getClient(sourceId);
    const { body } = await esClient.delete({
      index,
      id,
      refresh: true,
    });
    return body;
  }

  isIndexAccessible(sourceId: number, esIndex: string) {
    const config = this.getCurrentConfig(sourceId);

    return config.indices.some((pattern) => {
      const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`, 'i');
      return regex.test(esIndex);
    });
  }
}
