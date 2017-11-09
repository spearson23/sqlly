import Loggerly from '../../../../../loggerly/src/main/javascript/loggerly';
import { SqlBlock } from '../sqlly';

const logger = Loggerly.getLogger('sqlly');


export default class PostgresCommand {
  constructor(conn) {
    logger.debug('PostgresCommand');
    this.conn = conn;
  }

  _insertPlaceholders(array, values) {
    logger.debug('PostgresCommand._insertPlaceholders', array, values);
    if (!array) {
      return '';
    }
    let sql = array[0];
    let args = [];
    for (let i=1; i<array.length; i++) {
      if (values[i-1] instanceof SqlBlock) {
        sql += values[i-1].sql;
      } else {
        sql += '$' + i + array[i];
        args.push(values[i-1]);
      }
    }
    return [ sql, args ];
  }
  query(sql, ...args) {
    logger.debug('PostgresCommand.query');
    if (typeof sql === 'object') {
      logger.info('PostgresCommand.query array');
      [ sql, args ] = this._insertPlaceholders(sql, args);
    }
    this.sql = sql;
    this.values = args;
    logger.debug('PostgresCommand.query', this.sql, this.values);
    return this;
  }
  asMap() {
    this.rowMode = undefined;
    return this;
  }
  asArray() {
    this.rowMode = 'array';
    return this;
  }
  map(func) {
    this.mapFunc = func;
    return this;
  }
  _getQuery() {
    const query = {
      text: this.sql,
      values: this.values,
    };
    if (this.rowMode) {
      query.rowMode = this.rowMode;
    }
    return query;
  }
  async _exec() {
    logger.debug('PostgresCommand._exec');

    const query = this._getQuery();
    try {
      logger.info('Executing query (%s) with values (%s)', query.text, query.values);
      return await this.conn.query(query);
    } catch (error) {
      logger.error('Error executing query (' + query.text + ') ' + query.values, error);
      throw error;
    }
  }
  async single() {
    logger.debug('PostgresCommand.single');
    let result = await this._exec();
    if (result.rows.length < 1) {
      return null;
    }
    if (result.rows.length > 1) {
      throw new Error('Multiple rows returned for single query (' + query.txt + ')');
    }
    if (this.mapFunc) {
      return this.mapFunc.call(result.rows[0]);
    } else {
      return result.rows[0];
    }
  }
  async first() {
    let result = await this._exec();
    if (result.rows.length < 1) {
      return null;
    }
    if (this.mapFunc) {
      return this.mapFunc.call(result.rows[0]);
    } else {
      return esult.rows[0];
    }
  }
  async list() {
    const result = await this._exec();
    if (this.mapFunc) {
      return result.rows.map(this.mapFunc);
    } else {
      return result.rows;
    }
  }
  async execute() {
    return await this._exec();
  }
  async update() {
    return await this._exec();
  }
}
