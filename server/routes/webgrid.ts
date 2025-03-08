import express from 'express';
var router = express.Router();
var os = require('os');

import { DBMS, MSSQL_DB } from '../../config/viamedici-webapp-config';

//Connection MSSQL Datenbank
const mssql = require('mssql');
var configDB_MSSQL = {
  server: MSSQL_DB.server,
  // database: null,
  user: MSSQL_DB.user,
  password: MSSQL_DB.password,
  database: MSSQL_DB.database,
  options: {
    trustServerCertificate: true,
  },
  requestTimeout: 6000000,
};

//Environment-Settings
var environment = process.env.NODE_ENV;

// Linux=Prod-System
if (typeof environment == 'undefined') {
  environment = 'production';
}

let applicationName = 'viamedici-webgrid';

//Logger
const log4js = require('log4js');
var logLevel = 'info';
log4js.configure({
  appenders: {
    [applicationName]: { type: 'file', filename: applicationName + '.log' },
  },
  categories: { default: { appenders: [applicationName], level: logLevel } },
});
const logger = log4js.getLogger(applicationName);

const backendOS = os.type();

logger.info(
  '************************************************************************************************************'
);
logger.info(
  "Application '" + applicationName + "' ist started at : ",
  new Date()
);
logger.info('Log-Level: ', logLevel);
logger.info('Backend-Environment: ', environment);
logger.info('Server OS: ', backendOS);
logger.info('DBMS: ', DBMS);
logger.info(
  '************************************************************************************************************'
);

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/test', function (req, res, next) {
  res.send({ result: 'test backend-route okay' });
});

router.get('/getElementRelationAttributes', function (req, res, next) {
  res.send({ result: 'getElementRelationAttributes okay' });
});

async function executeSQL(sqlStatement) {
  if (DBMS == 'MSSQL') {
    try {
      // console.log("wir sind hier mein freund");
      var pool = await mssql.connect(configDB_MSSQL);
    } catch (err) {
      console.error('executeSQL() mssql db connect error: ', err);
      logger.error('executeSQL() mssql db connect error: ', err);
      return 'undefined';
    }

    try {
      let result = await pool.request().query(sqlStatement);

      // console.log("result: ", result);

      result.rows = [];
      if (result.recordsets.length > 0) {
        for (let i = 0; i < result.recordsets[0].length; i++) {
          let myObject = {};
          myObject = result.recordsets[0][i];
          let rowArray = [];
          for (const [key, value] of Object.entries(myObject)) {
            rowArray.push(value);
          }
          result.rows.push(rowArray);
        }

        //Wir bilden hier die Spaltennamen
        result.metaData = [];
        if (result.recordsets[0].length > 0) {
          let myColumnObject = {};
          myColumnObject = result.recordsets[0][0];
          for (const [key, value] of Object.entries(myColumnObject)) {
            // console.log("key", key);
            result.metaData.push({ name: key });
          }
        }
      }
      return result;
    } catch (err) {
      console.error('executeSQL() mssql sql error: ', err);
      logger.error('executeSQL() mssql sql error: ', err);
      console.error('executeSQL() mssql used sql statement: ', sqlStatement);
      logger.error('executeSQL() mssql used sql statement: ', sqlStatement);
      return null;
    }
  }
}

module.exports = router;
