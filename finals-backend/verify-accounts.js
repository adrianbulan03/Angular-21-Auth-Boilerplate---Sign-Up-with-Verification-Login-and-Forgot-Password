const { Sequelize, DataTypes } = require('sequelize');
const config = require('./src/config.json');

const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
    port: config.database.port
});

const Account = sequelize.define('account', {
    verified: { type: DataTypes.DATE }
}, { timestamps: false, tableName: 'accounts' });

async function verifyAll() {
    try {
        await sequelize.authenticate();
        const result = await Account.update(
            { verified: new Date() },
            { where: { verified: null } }
        );
        console.log(`Verified ${result[0]} accounts.`);
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

verifyAll();
