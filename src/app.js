const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerUiDist = require('swagger-ui-dist');
const path = require('path');
const config = require('./config');
const routes = require('./routes');
const docRoutes = require('./routes/doc');
const errorHandler = require('./middlewares/errorHandler');
const sequelize = require('./config/db');
const swaggerSpec = require('./config/swagger');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

const swaggerUiAssetPath = swaggerUiDist.getAbsoluteFSPath();
app.use('/swagger-ui', express.static(swaggerUiAssetPath));

app.use('/', docRoutes);

app.use('/swagger-ui.html', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Node RuoYi API 文档'
}));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Node RuoYi API 文档'
}));

app.use('/dev-api', routes);
app.use('/prod-api', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ code: 404, msg: '接口不存在', data: null });
});

app.use(errorHandler);

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    app.listen(config.port, () => {
      console.log(`服务启动成功，端口: ${config.port}`);
      console.log(`开发环境接口: http://localhost:${config.port}/dev-api`);
      console.log(`API 文档地址: http://localhost:${config.port}/doc.html`);
    });
  } catch (error) {
    console.error('服务启动失败:', error);
    process.exit(1);
  }
};

start();

module.exports = app;
