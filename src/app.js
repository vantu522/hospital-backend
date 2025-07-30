import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import route from './routes/index.js'
import userRouter from './routes/user.route.js';
import doctorRoutes from './routes/doctor.route.js';
import serviceRoutes from './routes/service.routes.js';
import specialtyRoutes from './routes/specialty.routes.js';
import newsRoutes from './routes/news.routes.js';
import introduceRoutes from './routes/introduce.routes.js';
import recruitmentRoutes from './routes/recruitment.routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
route(app);


// ...existing code...

// Quản lý người dùng (User)
app.use('/api/users', userRouter);

// Quản lý bác sĩ (Doctor)
app.use('/api/doctors', doctorRoutes);

// Quản lý dịch vụ y tế (Service)
app.use('/api/services', serviceRoutes);

// Quản lý chuyên khoa (Specialty)
app.use('/api/specialties', specialtyRoutes);

// Quản lý tin tức, bài viết (News)
app.use('/api/news', newsRoutes);

// Quản lý trang giới thiệu (Introduce)
app.use('/api/introduces', introduceRoutes);

// Quản lý tin tuyển dụng (Recruitment)
app.use('/api/recruitments', recruitmentRoutes);

// ...existing code...

app.get('/', (req, res) => {
  res.send('API is running...');
});

export default app;
