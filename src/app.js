import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import userRouter from './routes/user.route.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/users', userRouter);

app.get('/', (req, res) => {
  res.send('API is running...');
});

export default app;
