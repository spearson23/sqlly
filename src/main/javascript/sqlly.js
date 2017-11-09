import fs from 'fs';
import Utils from './utils/utils';
import Loggerly from '../../../../loggerly/src/main/javascript/loggerly';
import PostgresSqlly from './postgres/sqlly';

const logger = Loggerly.getLogger('sqlly');

export class SqlBlock {
  constructor(sql) {
    this.sql = sql;
  }
}


/**
 * sqlly
 * @param {*} args
 */
export function sqlly(...args) {
  if (!sqlly.initialized) {
    sqlly.init();
  }
  return sqlly.defaultDatabase.sqlly(...args);
}

/**
 * Init
 */
sqlly.init = function(config) {
  logger.debug('sqlly.init');
  if (sqlly.initialized) {
    return;
  }
  // If string config, load from file
  if (typeof config === 'string') {
    return init(Utils._loadJson(config));
  }
  // If no config, check environment var for config file name
  // Otherwise, just use default conifg
  if (!config) {
    if (process.env[sqlly.ENV_CONFIG_VARIABLE]) {
      return sqlly.init(process.env[sqlly.ENV_CONFIG_VARIABLE]);
    }
    config = {};
  }

  // Combine configs
  sqlly.config = Utils.deepAssign({}, sqlly.DEFAULT_CONFIG, config);

  // Create databases from config
  sqlly.databases = Object.entries(sqlly.config).map(([name, dbConfig]) => {
    if (dbConfig.type === 'postgres') {
      //if (!sqlly.PostgresSqlly) {
      //  sqlly.PostgresSqlly = require('./postgres/sqlly');
      //}
      //const database = new sqlly.PostgresSqlly(dbConfig);
      const database = new PostgresSqlly(dbConfig);
      if (name === 'default') {
        sqlly.defaultDatabase = database;
      }
      return database;
    }
  });
  if (!sqlly.defaultDatabase) {
    sqlly.defaultDatabase = sqlly.databases[0];
  }

  sqlly.initialized = true;
},


sqlly.db = function(name) {
  return sqlly.databases[name];
}

sqlly.sql = function(text) {
  return new SqlBlock(text);
}

sqlly.transaction = function(...args) {
  if (!sqlly.initialized) {
    sqlly.init();
  }
  return sqlly.defaultDatabase.transaction(...args);
}

sqlly.close = function() {
  sqlly.databases.forEach(database => {
    database.close();
  });
}


export function sql(text) {
  return sqlly.sql(text);
}

export function DB(name) {
  return sqlly.db(name);
}


sqlly.DEFAULT_CONFIG = { };
sqlly.ENV_CONFIG_VARIABLE = 'SQLLY_CONFIG_FILE';
