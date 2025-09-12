import app from './app.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
