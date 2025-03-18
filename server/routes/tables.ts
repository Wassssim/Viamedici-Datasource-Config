import { Router } from 'express';
import logger from '../helpers/logger';
import { getConfig } from '../services/configService';
import { DataSource } from '../types/data-source-config';
import ServiceFactory from '../services/tables/tableServiceFactory';

const config = getConfig();

export const tableRoutes = Router();

// Fetch all tables
tableRoutes.get('/:sourceType/:sourceId', async (req, res) => {
  try {
    const tableService = ServiceFactory.get(
      req.params.sourceType as DataSource
    );
    const tables = await tableService.getTables(parseInt(req.params.sourceId));
    console.log(tables);

    res.json({ tables });
  } catch (err) {
    res.status(500).json({ error: err.message });
    logger.error(err.message);
  }
});

// Fetch table structure (columns & their types)
tableRoutes.get('/:sourceType/:sourceId/:table/structure', async (req, res) => {
  const tableName = req.params.table;

  if (
    ![DataSource.Postgres, DataSource.MSSQL].includes(
      req.params.sourceType as DataSource
    )
  ) {
    res.status(400).send('wrong source');
    return;
  }

  try {
    const tableService = ServiceFactory.get(
      req.params.sourceType as DataSource
    );
    const columns = await tableService.getTableStructure(
      parseInt(req.params.sourceId),
      tableName
    );

    res.json({ columns });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Fetch rows with pagination
tableRoutes.get('/:sourceType/:sourceId/:table/rows', async (req, res) => {
  try {
    const { table, sourceType } = req.params;
    const tableService = ServiceFactory.get(sourceType as DataSource);
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

    const rows = await tableService.getRows(
      parseInt(req.params.sourceId),
      table,
      {
        filterBy,
        limit,
        offset,
        orderBy: orderBy
          ? { column: orderBy, direction: orderDirection }
          : undefined,
      }
    );

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
tableRoutes.post('/:sourceType/:sourceId/:table/rows', async (req, res) => {
  const { table, sourceType } = req.params;
  const row = req.body; // Assume that this is already transformed with the correct types
  const tableService = ServiceFactory.get(sourceType as DataSource);
  try {
    const insertedRow = await tableService.insertRow(
      parseInt(req.params.sourceId),
      table,
      row
    );
    res.json({ row: insertedRow[0] });
  } catch (err) {
    console.log(err);

    res.status(500).send('Error adding row: ' + err.message);
  }
});

tableRoutes.patch(
  '/:sourceType/:sourceId/:table/rows/:id',
  async (req, res) => {
    const { table, id, sourceType } = req.params;
    const row = req.body;
    const tableService = ServiceFactory.get(sourceType as DataSource);

    try {
      await tableService.updateRow(
        parseInt(req.params.sourceId),
        table,
        id,
        row
      );

      res.send({ message: 'Row updated' });
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
);

tableRoutes.delete(
  '/:sourceType/:sourceId/:table/rows/:id',
  async (req, res) => {
    const { table, id, sourceType, sourceId } = req.params;
    const tableService = ServiceFactory.get(sourceType as DataSource);

    try {
      await tableService.deleteRow(parseInt(sourceId), table, id);
      res.status(200).json({ message: 'Row deleted successfully' });
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
);

module.exports = tableRoutes;
