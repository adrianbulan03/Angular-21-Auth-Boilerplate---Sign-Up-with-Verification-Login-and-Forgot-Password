
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

    // const connection = await mysql.createConnection({ host, port, user, password })
    // await connection.query(`CREATE DATABASE IF NOT EXISTS \'${database}'`)

    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    await connection.end()



    const sequelize = new Sequelize(database, user, password, { dialect: "mysql" , host, port })


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