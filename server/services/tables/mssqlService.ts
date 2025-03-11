import TableService from './tableService';
import { mapType } from '../../types/type-mapper';
import { DataSource } from '../../types/data-source-config';

class MssqlService extends TableService {
  constructor(dbConfig: any) {
    super(dbConfig, 'mssql');
  }

  async getTableStructure(table: string) {
    const result = await this.db.raw(
      `
      SELECT COLUMN_NAME AS column_name, DATA_TYPE AS data_type, IS_NULLABLE AS is_nullable, COLUMN_DEFAULT AS column_default
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = ?`,
      [table]
    );

    const foreignKeys = await this.db.raw(
      `
      SELECT k.COLUMN_NAME AS column_name, fk.TABLE_NAME AS foreign_table, fk.COLUMN_NAME AS foreign_column
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE k
      JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc ON k.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
      JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE fk ON rc.UNIQUE_CONSTRAINT_NAME = fk.CONSTRAINT_NAME
      WHERE k.TABLE_NAME = ?`,
      [table]
    );

    const primaryKeys = await this.db.raw(
      `
      SELECT COLUMN_NAME AS column_name
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE OBJECTPROPERTY(OBJECT_ID(CONSTRAINT_SCHEMA + '.' + CONSTRAINT_NAME), 'IsPrimaryKey') = 1
      AND TABLE_NAME = ?`,
      [table]
    );

    const identityColumns = await this.db.raw(
      `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = ? 
      AND COLUMNPROPERTY(OBJECT_ID(TABLE_SCHEMA + '.' + TABLE_NAME), COLUMN_NAME, 'IsIdentity') = 1`,
      [table]
    );

    const primaryKeyColumns = primaryKeys.map((row) => row.column_name);
    const identityColumnNames = identityColumns.map((row) => row.COLUMN_NAME);

    return result.map((row) => ({
      name: row.column_name,
      type: mapType(row.data_type, DataSource.MSSQL),
      isNullable: row.is_nullable === 'YES',
      default: row.column_default,
      constraints: {
        primaryKey: primaryKeyColumns.includes(row.column_name),
        foreignKey:
          foreignKeys.find((fk) => fk.column_name === row.column_name) || null,
      },
      isAutoGenerated: identityColumnNames.includes(row.column_name),
    }));
  }

  async getTables() {
    try {
      const result = await this.db
        .select('TABLE_NAME')
        .from('INFORMATION_SCHEMA.TABLES')
        .where('TABLE_CATALOG', this.dbConfig.database)
        .andWhere('TABLE_TYPE', 'BASE TABLE');

      return result
        .map((row) => row.TABLE_NAME)
        .filter((table) => this.isTableAccessible(table));
    } catch (error) {
      console.error('Error fetching tables:', error);
      throw new Error('Failed to fetch tables');
    }
  }
}

export default MssqlService;
