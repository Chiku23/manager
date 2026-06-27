import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import apiRouter from './routes';
import { errorHandler } from './middleware/error-handler';
import swaggerDocument from '../swagger.json';

const app = express();

// Interactive Swagger UI Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

// Body parsers
app.use(express.json());
app.use(cookieParser());

// Mount API routes
app.use('/api', apiRouter);

// Global Error Handler
app.use(errorHandler);

// Page Not Found Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start Server
app.listen(env.PORT, env.HOST, () => {
  console.log(`[Server]: Manager Backend API running on http://${env.HOST}:${env.PORT}`);
  console.log(`[Server]: Environment: ${env.NODE_ENV}`);
});
