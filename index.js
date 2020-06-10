const Koa = require('koa');
const cors = require('@koa/cors');
const logger = require('koa-logger');
const DatabaseConnection = require('./db/index');

const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes/apiRoutes');

const app = new Koa();

DatabaseConnection.getConnection();

app.use(logger());
app.use(errorHandler);
app.use(cors());

app
  .use(apiRoutes.routes())
  .use(apiRoutes.allowedMethods())
  .listen(process.env.PORT);
