import { Pool } from 'pg';
import PostgresCommand from './command';
import Loggerly from '../../../../../loggerly/src/main/javascript/loggerly';

const logger = Loggerly.getLogger('sqlly');

export default class PostgresSqlly {
  constructor(config) {
    logger.debug('PostgresSqlly.constructor');
    this.config = Object.assign({}, config);

    this.pool = new Pool(this.config);
  }


  sqlly(...args) {
    logger.debug('PostgresSqlly.sqlly');
    const command = new PostgresCommand(this.conn || this.pool);
    return command.query(...args);
  }

  close() {
    this.pool.end();
  }

  async transaction(func) {
    const conn = await pool.connect()

    try {
      await conn.query('BEGIN');

      const result = await func.call(new PostgresSqlly(conn));

      await conn.query('COMMIT')

      return result;

    } catch (error) {
      await client.query('ROLLBACK')
      throw error;
    } finally {
      conn.release()
    }
  }
}
