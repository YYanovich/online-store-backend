import {Sequelize} from "sequelize";

export const sequelize = new Sequelize(
    process.env.DB_NAME!, //db name
    process.env.DB_USER!, //db username
    process.env.DB_PASSWORD!, //password
    {
        dialect: "postgres",
        host: process.env.DB_HOST!,
        port: Number(process.env.DB_PORT!),
    }
)