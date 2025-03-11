import knex from 'knex';
import { DataSource, PostgresConfig } from '../../types/data-source-config';
import { MSSLConfig } from 'src/app/models/datasource-config.model';

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
  protected db: knex.Knex;
  protected dbConfig: PostgresConfig | MSSLConfig;

  constructor(dbConfig: PostgresConfig | MSSLConfig, client: 'pg' | 'mssql') {
    this.db = knex({ client, connection: dbConfig });
    this.dbConfig = dbConfig;
  }

  async getRows(table: string, options: GetRowsOptions = {}) {
    try {
      let query = this.db(table).select('*');

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

      if (options.limit) query = query.limit(options.limit);
      if (options.offset) query = query.offset(options.offset);

      return await query;
    } catch (error) {
      console.error('Error fetching rows:', error);
      throw new Error('Database query failed');
    }
  }

  async insertRow(table: string, row: any) {
    return await this.db(table).insert(row).returning('*');
  }

  async updateRow(table: string, id: any, row: any) {
    return await this.db(table).where({ id }).update(row).returning('*');
  }

  async deleteRow(table: string, id: any) {
    return await this.db(table).where({ id }).del();
  }

  isTableAccessible(tableName: string) {
    return this.dbConfig.tables.some(({ pattern }) => {
      const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`, 'i');
      return regex.test(tableName);
    });
  }

  abstract getTableStructure(table: string): Promise<any>;

  abstract getTables(): Promise<string[]>;
}

export default TableService;
