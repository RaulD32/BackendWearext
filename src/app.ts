import express from 'express';
import productRoutes from './routes/productRoutes.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

const app = express();

app.use(express.json());

app.use('/productos', productRoutes);


app.use(errorMiddleware);

export default app;
