import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
config();
export const dataSourceOptions: DataSourceOptions = {
  // name: 'mysql',
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: String(process.env.DB_PASSWORD),
  database: process.env.DB_DATABASE,
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true, // Set to false in production
};
const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
