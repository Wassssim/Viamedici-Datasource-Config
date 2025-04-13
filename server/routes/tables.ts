import { Router } from 'express';
import logger from '../helpers/logger';
import { DataSource } from '../types/data-source-config';
import ServiceFactory from '../services/tables/tableServiceFactory';

export const tableRoutes = Router();

// Fetch all tables
tableRoutes.get('/:sourceType/:sourceId', async (req, res) => {
  try {
    const tableService = ServiceFactory.get(
      req.params.sourceType as DataSource
    );
    const tables = await tableService.getTables(parseInt(req.params.sourceId));

    res.json({ tables });
  } catch (err) {
    res.json({ error: 'Failed to fetch tables', details: err.message });
    const errorMsg = `❌ Failed to fetch tables for sourceType: ${req.params.sourceType}, sourceId: ${req.params.sourceId}`;
    logger.error(`${errorMsg}\nError: ${err.message}\nStack: ${err.stack}`);
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
    const context = {
      route: 'GET /:sourceType/:sourceId/:table/structure',
      params: req.params,
    };

    logger.error('❌ Error fetching table structure', {
      message: err.message,
      stack: err.stack,
      context,
    });

    res.status(500).json({
      error: 'Failed to fetch table structure',
      details: err.message,
    });
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
      nextOffset: offset + rows.length, // Ensures nextOffset matches actual returned rows
    });
  } catch (err) {
    const context = {
      route: 'GET /:sourceType/:sourceId/:table/rows',
      params: req.params,
      query: req.query,
    };

    logger.error('❌ Error fetching rows', {
      message: err.message,
      stack: err.stack,
      context,
    });

    res.status(500).json({
      error: 'Failed to fetch rows',
      details: err.message,
    });
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
    const context = {
      route: 'POST /:sourceType/:sourceId/:table/rows',
      params: req.params,
      body: req.body,
    };

    logger.error('❌ Error adding row', {
      message: err.message,
      stack: err.stack,
      context,
    });

    res.status(500).json({
      error: 'Error adding row',
      details: err.message,
    });
  }
});

tableRoutes.patch(
  '/:sourceType/:sourceId/:table/rows/:id',
  async (req, res) => {
    const { table, id, sourceType } = req.params;
    const row = req.body;
    const tableService = ServiceFactory.get(sourceType as DataSource);

    try {
      await tableService.updateRowById(
        parseInt(req.params.sourceId),
        table,
        id,
        row
      );

      res.send({ message: 'Row updated' });
    } catch (err) {
      const context = {
        route: 'PATCH /:sourceType/:sourceId/:table/rows/:id',
        params: req.params,
        body: req.body,
      };

      logger.error('❌ Error updating row', {
        message: err.message,
        stack: err.stack,
        context,
      });

      res.json({ error: 'Failed to update row', details: err.message });
    }
  }
);

tableRoutes.patch('/:sourceType/:sourceId/:table/rows', async (req, res) => {
  const { table, sourceId, sourceType } = req.params;
  const { where, values } = req.body;

  if (!where || !values) {
    return res
      .status(400)
      .json({ error: '`where` and `values` must be provided in the body.' });
  }

  const tableService = ServiceFactory.get(sourceType as DataSource);

  try {
    const result = await tableService.updateRow(
      parseInt(sourceId, 10),
      table,
      where,
      values
    );

    res.json({ message: 'Row updated', result });
  } catch (err: any) {
    const context = {
      route: 'PATCH /:sourceType/:sourceId/:table/rows',
      params: req.params,
      body: req.body,
    };

    logger.error('❌ Error updating row', {
      message: err.message,
      stack: err.stack,
      context,
    });

    res
      .status(500)
      .json({ error: 'Failed to update row', details: err.message });
  }
});

tableRoutes.delete(
  '/:sourceType/:sourceId/:table/rows/:id',
  async (req, res) => {
    const { table, id, sourceType, sourceId } = req.params;
    const tableService = ServiceFactory.get(sourceType as DataSource);

    try {
      await tableService.deleteRow(parseInt(sourceId), table, id);
      res.status(200).json({ message: 'Row deleted successfully' });
    } catch (err) {
      const context = {
        route: 'DELETE /:sourceType/:sourceId/:table/rows/:id',
        params: req.params,
      };

      logger.error('❌ Error deleting row', {
        message: err.message,
        stack: err.stack,
        context,
      });

      res
        .status(500)
        .json({ error: 'Failed to delete row', details: err.message });
    }
  }
);

module.exports = tableRoutes;
