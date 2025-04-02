import knex from 'knex';
import { DataSource, PostgresConfig } from '../../types/data-source-config';
import { MSSLConfig } from 'src/app/models/datasource-config.model';
import { getConfig } from '../configService';

interface FilterCondition {
  column: string;
  operator?: '=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'ILIKE' | 'IN';
  value: any;
}

interface GetRowsOptions {
  filterBy?: FilterCondition[];
  limit?: number;
  offset?: number;
  orderBy?: { column: string; direction?: 'ASC' | 'DESC' };
}

abstract class TableService {
  protected sourceType: DataSource = DataSource.MSSQL;
  protected knexClients = {
    [DataSource.Postgres]: 'pg',
    [DataSource.MSSQL]: 'mssql',
  };
  protected dbConfig: PostgresConfig | MSSLConfig;
  private clients: Map<number, knex.Knex<any, any[]>>;

  constructor() {
    this.clients = new Map();
  }

  protected getCurrentConfig(sourceId: number) {
    const config = getConfig();

    return config.sourcesConfig[this.sourceType][sourceId] as
      | PostgresConfig
      | MSSLConfig;
  }

  protected getClient(sourceId: number) {
    if (!this.clients.has(sourceId)) {
      const config = this.getCurrentConfig(sourceId);
      const dbClient = knex({
        client: this.knexClients[this.sourceType],
        connection: config,
      });

      this.clients.set(sourceId, dbClient);
    }
    return this.clients.get(sourceId)!;
  }

  async getRows(sourceId: number, table: string, options: GetRowsOptions = {}) {
    try {
      const client = this.getClient(sourceId);
      let query = client(table).select('*');

      if (options.filterBy) {
        options.filterBy.forEach(({ column, operator = '=', value }) => {
          if (operator === 'IN' && Array.isArray(value)) {
            query = query.whereIn(column, value);
          } else if (operator === 'LIKE' || operator === 'ILIKE') {
            query = query.whereRaw(`CAST(?? AS TEXT) ${operator} ?`, [
              column,
              value,
            ]);
          } else {
            query = query.where(column, operator, value);
          }
        });
      }

      if (options.orderBy) {
        query = query.orderBy(
          options.orderBy.column,
          options.orderBy.direction || 'ASC'
        );
      }

      // MSSQL 2012+ requires ORDER BY when using OFFSET and FETCH NEXT
      if (options.limit || options.offset) {
        if (!options.orderBy) {
          query = query.orderByRaw('(SELECT NULL)'); // Ensures ORDER BY exists to avoid errors
        }
      }

      if (options.limit) query = query.limit(options.limit);
      if (options.offset) query = query.offset(options.offset);

      return await query;
    } catch (error) {
      console.error('Error fetching rows:', error);
      throw new Error('Database query failed');
    }
  }

  async insertRow(sourceId: number, table: string, row: any) {
    return await this.getClient(sourceId)(table).insert(row).returning('*');
  }

  async updateRow(sourceId: number, table: string, id: any, row: any) {
    return await this.getClient(sourceId)(table)
      .where({ id })
      .update(row)
      .returning('*');
  }

  async deleteRow(sourceId: number, table: string, id: any) {
    return await this.getClient(sourceId)(table).where({ id }).del();
  }

  isTableAccessible(sourceId: number, tableName: string) {
    const config = this.getCurrentConfig(sourceId);

    if (!config.tables || config.tables.length === 0) return true;

    return config.tables.some(({ pattern }) => {
      const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`, 'i');
      return regex.test(tableName);
    });
  }

  abstract getTableStructure(sourceId: number, table: string): Promise<any>;

  abstract getTables(sourceId: number): Promise<string[]>;
}

export default TableService;
