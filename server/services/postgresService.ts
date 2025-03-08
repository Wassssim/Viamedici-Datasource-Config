import knex from 'knex';
import { getConfig } from './configService';
import { PostgresConfig } from '../types/data-source-config';

const config = getConfig();

const db = knex({
  client: 'pg',
  connection: config.sourcesConfig[config.selectedSource] as PostgresConfig,
});

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

const getRows = async (table: string, options: GetRowsOptions = {}) => {
  try {
    console.log(options);

    let query = db(table).select('*');

    // Filtering
    if (options.filterBy) {
      options.filterBy.forEach(({ column, operator = '=', value }) => {
        if (operator === 'IN' && Array.isArray(value)) {
          query = query.whereIn(column, value);
        } else if (operator === 'LIKE' || operator === 'ILIKE') {
          // Convert UUID columns to text for LIKE searches
          query = query.whereRaw(`CAST(?? AS TEXT) ${operator} ?`, [
            column,
            value,
          ]);
        } else {
          query = query.where(column, operator, value);
        }
      });
    }

    // Sorting
    if (options.orderBy) {
      query = query.orderBy(
        options.orderBy.column,
        options.orderBy.direction || 'ASC'
      );
    }

    // Pagination
    if (options.limit) query = query.limit(options.limit);
    if (options.offset) query = query.offset(options.offset);

    return await query;
  } catch (error) {
    console.error('Error fetching rows:', error);
    throw new Error('Database query failed');
  }
};

export { getRows };
