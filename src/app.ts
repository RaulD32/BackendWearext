import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import roleRoutes from './routes/roleRoutes.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

dotenv.config();
const app = express();



app.use(morgan('dev'));
app.use(express.json());


app.use('/roles', roleRoutes);


app.use(errorMiddleware);

export default app;
