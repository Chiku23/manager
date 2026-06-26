import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import apiRouter from './routes';
import { errorHandler } from './middleware/error-handler';

const app = express();

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
