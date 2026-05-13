const { Sequelize, DataTypes } = require('sequelize');
const config = require('./src/config.json');

const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
    port: config.database.port
});

async function check() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("SHOW TABLES LIKE 'refreshTokens'");
        console.log(results.length > 0 ? "Table exists" : "Table DOES NOT exist");
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

check();
