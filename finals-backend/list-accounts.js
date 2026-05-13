const { Sequelize, DataTypes } = require('sequelize');
const config = require('./src/config.json');

const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
    port: config.database.port
});

const Account = sequelize.define('account', {
    email: { type: DataTypes.STRING },
    verified: { type: DataTypes.DATE }
}, { timestamps: false, tableName: 'accounts' });

async function list() {
    try {
        await sequelize.authenticate();
        const accounts = await Account.findAll();
        console.log(JSON.stringify(accounts, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

list();
