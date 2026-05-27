const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Node.js RuoYi API',
      version: '1.0.0',
      description: 'Node.js 版本 RuoYi 后台管理系统 API 文档',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '开发环境'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            code: {
              type: 'integer',
              example: 200
            },
            msg: {
              type: 'string',
              example: '操作成功'
            },
            data: {
              type: 'object'
            }
          }
        },
        TableResponse: {
          type: 'object',
          properties: {
            code: {
              type: 'integer',
              example: 200
            },
            msg: {
              type: 'string',
              example: '查询成功'
            },
            rows: {
              type: 'array',
              items: {
                type: 'object'
              }
            },
            total: {
              type: 'integer',
              example: 100
            }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
