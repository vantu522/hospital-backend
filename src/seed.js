import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';

import User from './models/user.model.js';
import Doctor from './models/doctor.model.js';
import Service from './models/service.model.js';
import Specialty from './models/specialty.model.js';
import News from './models/news.model.js';
import Introduce from './models/introduce.model.js';
import Recruitment from './models/recruitment.model.js';
faker.locale = 'en'; 
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital';

async function seed() {
  await mongoose.connect(MONGO_URI);

  // Xóa dữ liệu cũ
  await Promise.all([
    User.deleteMany({}),
    Doctor.deleteMany({}),
    Service.deleteMany({}),
    Specialty.deleteMany({}),
    News.deleteMany({}),
    Introduce.deleteMany({}),
    Recruitment.deleteMany({})
  ]);

  // User
  await User.create([
    {
      id: faker.string.uuid(),
      name: 'Admin',
      email: 'admin@hospital.com',
      password: '123456'
    },
    {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: '123456'
    }
  ]);

  // Specialty
  const specialties = Array.from({ length: 5 }).map(() => ({
    id: faker.string.uuid(),
    tenChuyenKhoa: faker.commerce.department(),
    moTa: faker.lorem.sentence(),
    hinhAnh: faker.image.url(),
    bacSiLienQuan: [],
    dichVuLienQuan: [],
    trangThai: true,
    ngayTao: faker.date.past(),
    ngayCapNhat: faker.date.recent()
  }));
  await Specialty.insertMany(specialties);

  // Doctor
  const doctors = Array.from({ length: 10 }).map(() => ({
    id: faker.string.uuid(),
    hoTen: faker.person.fullName(),
    chuyenKhoa: faker.helpers.arrayElement(specialties).tenChuyenKhoa,
    hocVi: faker.person.jobTitle(),
    moTa: faker.lorem.sentence(),
    kinhNghiem: faker.number.int({ min: 1, max: 30 }),
    lichKham: [
      {
        thu: 'Thứ 2',
        khungGio: ['08:00-10:00', '14:00-16:00']
      }
    ],
    avatarUrl: faker.image.avatar(),
    bangCap: [faker.lorem.word()],
    soDienThoai: faker.phone.number(),
    email: faker.internet.email(),
    diaChiLamViec: faker.location.streetAddress(),
    danhGia: faker.number.float({ min: 3, max: 5, precision: 0.1 }),
    luotDanhGia: faker.number.int({ min: 0, max: 100 }),
    trangThai: true
  }));
  await Doctor.insertMany(doctors);

  // Service
  const services = Array.from({ length: 8 }).map(() => ({
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    description: faker.lorem.paragraph(),
    price: faker.number.float({ min: 100000, max: 2000000, precision: 1000 }),
    duration: faker.number.int({ min: 15, max: 120 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }));
  await Service.insertMany(services);

  // News
  await News.insertMany(
    Array.from({ length: 6 }).map(() => ({
      id: faker.string.uuid(),
      tieuDe: faker.lorem.sentence(),
      slug: faker.lorem.slug(),
      moTaNgan: faker.lorem.sentence(),
      noiDung: faker.lorem.paragraphs(2),
      hinhAnh: faker.image.url(),
      tacGia: faker.person.fullName(),
      chuyenMuc: faker.helpers.arrayElement(['Cảnh báo', 'Sức khỏe', 'Tin bệnh viện']),
      tags: [faker.lorem.word(), faker.lorem.word()],
      ngayDang: faker.date.past(),
      trangThai: true,
      luotXem: faker.number.int({ min: 0, max: 1000 }),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    }))
  );

  // Introduce
  await Introduce.insertMany(
    Array.from({ length: 2 }).map(() => ({
      id: faker.string.uuid(),
      tieuDe: faker.lorem.words(3),
      slug: faker.lorem.slug(),
      moTaNgan: faker.lorem.sentence(),
      noiDung: faker.lorem.paragraphs(2),
      hinhAnh: faker.image.url(),
      trangThai: true,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    }))
  );

  // Recruitment
  await Recruitment.insertMany(
    Array.from({ length: 4 }).map(() => ({
      id: faker.string.uuid(),
      title: faker.person.jobTitle(),
      position: faker.person.jobType(),
      departmentId: faker.helpers.arrayElement(specialties).id,
      description: faker.lorem.paragraph(),
      requirements: [faker.lorem.sentence(), faker.lorem.sentence()],
      benefits: [faker.lorem.sentence(), faker.lorem.sentence()],
      deadline: faker.date.future(),
      location: faker.location.city(),
      contactEmail: faker.internet.email(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    }))
  );

  console.log('Seed dữ liệu mẫu thành công!');
  process.exit();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});