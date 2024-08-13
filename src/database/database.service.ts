import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);

  private pool: Pool;

  constructor() {
    const maxPoolSize = parseInt(process.env.DATABASE_MAX_POOL_SIZE || '15');
    this.logger.log(
      `database url is ${process.env.DATABASE_URL?.substring(
        0,
        25,
      )}...${process.env.DATABASE_URL?.substring(process.env.DATABASE_URL?.length - 25)}`,
    );
    this.logger.log(`database max Pool Size ${maxPoolSize}`);
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      application_name: 'Alter_Backend',
      max: maxPoolSize,
      ssl:
        process.env.DATABASE_NOSSL === 'true'
          ? undefined
          : {
              rejectUnauthorized: false,
            },
    });
    this.pool.on('connect', (client) => {
      client.query(`SET intervalstyle = 'iso_8601'`);
    });
  }

  async query<R extends QueryResultRow = any>(query: {
    text: string;
    values: any[];
  }): Promise<QueryResult<R>> {
    return this.pool.query(query);
  }

  async connect(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async onModuleInit() {}

  async onModuleDestroy() {
    this.logger.log(`disconnecting from database`);
    await this.pool.end();
    this.logger.log(`disconnected from database`);
  }
}