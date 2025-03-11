import { Router } from 'express';
import logger from '../helpers/logger';
import { getConfig } from '../services/configService';
import { DataSource } from '../types/data-source-config';
import { default as tableService } from '../services/tables/tableServiceFactory';

const config = getConfig();

export const tableRoutes = Router();

// Fetch all tables
tableRoutes.get('/', async (req, res) => {
  try {
    const tables = await tableService.getTables();
    console.log(tables);

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
    const columns = await tableService.getTableStructure(tableName);

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
    const rows = await tableService.getRows(table, {
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

// Knex insert
tableRoutes.post('/:table/rows', async (req, res) => {
  const { table } = req.params;
  const row = req.body; // Assume that this is already transformed with the correct types

  try {
    const insertedRow = await tableService.insertRow(table, row);
    res.json(insertedRow);
  } catch (err) {
    console.log(err);

    res.status(500).send('Error adding row: ' + err.message);
  }
});

tableRoutes.put('/:table/rows/:id', async (req, res) => {
  const { table, id } = req.params;
  const row = req.body;

  try {
    await tableService.updateRow(table, id, row);

    res.send({ message: 'Row updated' });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

tableRoutes.delete('/:table/rows/:id', async (req, res) => {
  const { table, id } = req.params;

  try {
    await tableService.deleteRow(table, id);
    res.status(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = tableRoutes;
