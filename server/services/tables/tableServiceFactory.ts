import { DataSource } from '../../types/data-source-config';
import PostgresService from './postgresService';
import MssqlService from './mssqlService';

class ServiceFactory {
  static services = {
    [DataSource.Postgres]: new PostgresService(),
    [DataSource.MSSQL]: new MssqlService(),
  };

  static get(sourceType: DataSource) {
    if (!Object.keys(this.services).includes(sourceType)) throw new Error();

    return this.services[sourceType];
  }
}

export default ServiceFactory;
