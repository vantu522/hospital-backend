import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import route from './routes/index.js'
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
route(app);




export default app;
