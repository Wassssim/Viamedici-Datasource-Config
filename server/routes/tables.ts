import { Router } from 'express';
import { Pool } from 'pg';
import logger from '../helpers/logger';
import { getConfig } from '../services/configService';
import { DataSource } from '../types/data-source-config';
import { mapType } from '../types/type-mapper';
import * as postgresService from '../services/postgresService';

const config = getConfig();
const pool = [DataSource.Postgres, DataSource.MSSQL].includes(
  config.selectedSource
)
  ? new Pool(config.sourcesConfig[config.selectedSource])
  : null;

export const tableRoutes = Router();

// Fetch all tables
tableRoutes.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
    );
    const tables = result.rows.map((row) => row.table_name);
    res.json({ tables });
  } catch (err) {
    res.status(500).json({ error: err.message });
    logger.error(err.message);
  }
});

// Fetch table structure (columns & their types)
tableRoutes.get('/:table/structure', async (req, res) => {
  const tableName = req.params.table;
  const sourceType = config.selectedSource as
    | DataSource.MSSQL
    | DataSource.Postgres;

  if (
    ![DataSource.Postgres, DataSource.MSSQL].includes(sourceType as DataSource)
  ) {
    res.status(400).send('wrong source');
    return;
  }

  try {
    const result = await pool.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1`,
      [tableName]
    );

    const columns = result.rows.map((row) => ({
      name: row.column_name,
      type: mapType(row.data_type, sourceType),
    }));

    res.json({ columns });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Fetch rows with pagination
tableRoutes.get('/:table/rows', async (req, res) => {
  const { table } = req.params;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;
  const orderBy = req.query.orderBy as string;
  const orderDirection =
    (req.query.orderDirection as string)?.toUpperCase() === 'DESC'
      ? 'DESC'
      : 'ASC';

  // Handle filters from query params
  const filterBy = [];
  if (req.query.column && req.query.value) {
    const columns = Array.isArray(req.query.column)
      ? req.query.column
      : [req.query.column];
    const values = Array.isArray(req.query.value)
      ? req.query.value
      : [req.query.value];
    const operators = Array.isArray(req.query.operator)
      ? req.query.operator
      : [req.query.operator || '='];

    columns.forEach((col, index) => {
      filterBy.push({
        column: col,
        operator: operators[index] || '=',
        value: values[index],
      });
    });
  }

  try {
    const rows = await postgresService.getRows(table, {
      filterBy,
      limit,
      offset,
      orderBy: orderBy
        ? { column: orderBy, direction: orderDirection }
        : undefined,
    });

    res.json({
      rows,
      limit,
      offset,
      nextOffset: offset + limit,
    });
  } catch (err) {
    console.error('Error fetching rows:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// CRUD operations on rows
tableRoutes.put('/:table/rows/:id', async (req, res) => {
  const { table, id } = req.params;
  const row = req.body;

  try {
    let setClause = '';
    let values = [];
    Object.keys(row).forEach((key, index) => {
      setClause += `${key} = $${index + 1}, `;
      values.push(row[key]);
    });

    setClause = setClause.slice(0, -2); // Remove last comma
    const query = `UPDATE ${table} SET ${setClause} WHERE id = $${
      values.length + 1
    }`;
    await pool.query(query, [...values, id]);

    res.send('Row updated');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

tableRoutes.delete('/:table/rows/:id', async (req, res) => {
  const { table, id } = req.params;

  try {
    await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
    res.send('Row deleted');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = tableRoutes;
