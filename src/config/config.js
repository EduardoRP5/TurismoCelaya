require('dotenv').config();

const {db_host, db_user, db_password, port} = process.env

module.exports = {db_host, db_user, db_password, port};