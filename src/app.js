import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import route from './routes/index.js';
import { swaggerUi, specs } from './config/swagger.js';

const app = express();

app.use(cors({
  origin: "*",                  // Mở full cho tất cả domains
  credentials: false,
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(morgan('dev'));
// Cho phép truy cập file upload
app.use("/uploads", express.static("uploads"));


// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  swaggerOptions: {
    authAction: {
      bearerAuth: {
        name: 'bearerAuth',
        schema: {
          type: 'http',
          in: 'header',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        value: ''
      }
    }
  },
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Hospital API Documentation'
}));

route(app);

app.get('/', (req, res) => {
  res.json({
    message: 'Hospital Management API is running!',
    documentation: '/api-docs',
    version: '1.0.0'
  });
});

export default app;
