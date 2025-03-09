import knex from 'knex';
import { getConfig } from './configService';
import { DataSource, PostgresConfig } from '../types/data-source-config';
import { mapType } from '../types/type-mapper';

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

const getTableStructure = async (table: string) => {
  const result = await db('information_schema.columns')
    .select('column_name', 'data_type', 'is_nullable', 'column_default')
    .where('table_name', table);

  // NOTE: we will assume we're in the public schema
  // Step 2: Get foreign key info from `pg_constraint`
  const foreignKeys = await db.raw(
    `
      SELECT
      tc.table_schema, 
      tc.constraint_name, 
      tc.table_name, 
      kcu.column_name, 
      ccu.table_schema AS foreign_table_schema,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema='public'
          AND tc.table_name=:tableName;
    `,
    {
      tableName: table,
    }
  );

  // Step 3: Map result to columns, including foreign key information
  const columns = result.map((row) => {
    const constraints = {};
    const foreignKey = foreignKeys.rows.find(
      (fk) => fk.column_name === row.column_name
    );

    if (!!foreignKey) {
      constraints['foreignKey'] = {
        foreignTable: foreignKey ? foreignKey.foreign_table_name : null,
        foreignColumn: foreignKey ? foreignKey.foreign_column_name : null,
      };
    }

    return {
      name: row.column_name,
      type: mapType(row.data_type, DataSource.Postgres),
      isNullable: row.is_nullable,
      default: row.column_default,
      constraints,
    };
  });

  return columns;
};

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

const insertRow = async (table: string, row: any) => {
  console.log(row);

  return await db(table).insert(row).returning('*');
};

export { getTableStructure, getRows, insertRow };
