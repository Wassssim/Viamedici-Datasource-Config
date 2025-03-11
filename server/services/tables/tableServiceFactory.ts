import { getConfig } from '../configService';
import { DataSource } from '../../types/data-source-config';
import PostgresService from './postgresService';
import MssqlService from './mssqlService';
import TableService from './tableService';

const config = getConfig();
const selectedConfig = config.sourcesConfig[config.selectedSource];

const service =
  config.selectedSource === DataSource.Postgres
    ? new PostgresService(selectedConfig)
    : new MssqlService(selectedConfig);

export default service as TableService;
