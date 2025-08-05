import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import route from './routes/index.js';
import { swaggerUi, specs } from './config/swagger.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
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
