
import config from "../config.json"
import mysql from "mysql2/promise"
import { Sequelize } from "sequelize"

export interface Database {
    User: any;
    Account: any;
    RefreshToken: any;
}


export const db: Database = {} as Database;

export async function initialize(): Promise<void> {
    const { host, port, user, password, database } = config.database
    console.log(`Connecting to database: ${database} at ${host}:${port}`);

    try {
        // Attempt to create the database if it doesn't exist
        const connection = await mysql.createConnection({ host, port, user, password });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
        await connection.end();
        console.log(`Database "${database}" verified/created.`);
    } catch (err) {
        console.warn(`Warning: Could not check/create database "${database}". Proceeding with existing...`, err);
    }

    const sequelize = new Sequelize(database, user, password, { 
        dialect: "mysql", 
        host, 
        port,
        logging: false // Disable logging to keep console clean
    });

    try {
        // Test the connection
        await sequelize.authenticate();
        console.log('Sequelize connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database with Sequelize:', error);
        throw error;
    }

    const { default: userModel } = await import("../users/user.model")
    const { default: accountModel } = await import("../accounts/account.model")
    const { default: refreshTokenModel } = await import("../accounts/refresh-token.model")

    db.User = userModel(sequelize)
    db.Account = accountModel(sequelize)
    db.RefreshToken = refreshTokenModel(sequelize)

    db.Account.hasMany(db.RefreshToken, { onDelete: "CASCADE" })
    db.RefreshToken.belongsTo(db.Account)

    await sequelize.sync({ alter: true })
    console.log("_______DATABASE INITIALIZED AND MODELS SYNCED_______")
}