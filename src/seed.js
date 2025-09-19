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
import HealthConsultation from './models/health-consultation.model.js';
import Application from './models/application.model.js';
import BackgroundBanner from './models/background-banner.model.js';
import { generateSlug } from './utils/slug.js';

faker.locale = 'vi'; 
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital';

// Helper function để xóa index cũ
async function dropOldIndexes() {
  const collections = [
    { model: News, name: 'News' },
    { model: Introduce, name: 'Introduce' },
    { model: Recruitment, name: 'Recruitment' },
    { model: HealthConsultation, name: 'HealthConsultation' }
  ];

  for (const { model, name } of collections) {
    try {
      await model.collection.dropIndex('id_1');
      console.log(`✅ Đã xóa index id_1 cũ từ ${name}`);
    } catch (error) {
      console.log(`ℹ️  Index id_1 ${name} không tồn tại hoặc đã được xóa`);
    }
  }
}

// Helper function để tạo URL ảnh thật
function getRandomImage(category = 'healthcare') {
  const images = {
    healthcare: [
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=600&fit=crop'
    ],
    doctor: [
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1643297654055-14cfe97d9369?w=400&h=400&fit=crop'
    ],
    medical: [
      'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1584467735871-8e36ebab8b5c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&h=600&fit=crop'
    ],
    banner: [
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=1600&h=400&fit=crop'
    ]
  };
  
  return faker.helpers.arrayElement(images[category] || images.healthcare);
}

async function seed() {
  await mongoose.connect(MONGO_URI);

  // Xóa tất cả index cũ
  await dropOldIndexes();

  // Xóa dữ liệu cũ
  await Promise.all([
    User.deleteMany({}),
    Doctor.deleteMany({}),
    Service.deleteMany({}),
    Specialty.deleteMany({}),
    News.deleteMany({}),
    Introduce.deleteMany({}),
    Recruitment.deleteMany({}),
    HealthConsultation.deleteMany({}),
    Application.deleteMany({}),
    BackgroundBanner.deleteMany({})
  ]);

  console.log('🗑️  Đã xóa dữ liệu cũ');

  // User - Tạo 10 users
  const users = await User.create([
    {
      name: 'Admin Hospital',
      email: 'admin@hospital.com',
      password: '123456',
      role: 'superadmin'
    },
    {
      name: 'Bác sĩ Nguyễn Văn Nam',
      email: 'doctor@hospital.com',
      password: '123456',
      role: 'admin'
    },
    {
      name: 'Nguyễn Thị Hoa',
      email: 'user@hospital.com',
      password: '123456',
      role: 'admin'
    },
    ...Array.from({ length: 7 }).map((_, index) => ({
      name: faker.helpers.arrayElement([
        'Nguyễn Văn Hùng', 'Trần Thị Mai', 'Lê Văn Đức', 
        'Phạm Thị Lan', 'Hoàng Văn Minh', 'Vũ Thị Hoa',
        'Đỗ Văn Thành', 'Bùi Thị Nga', 'Đinh Văn Tú', 
        'Ngô Thị Linh', 'Đặng Văn Long', 'Lý Thị Thu'
      ]) + ` ${index + 4}`,
      email: faker.internet.email(),
      password: '123456',
      role: faker.helpers.arrayElement(['admin', 'superadmin'])
    }))
  ]);

  console.log('👥 Đã tạo 10 users');

  // Specialty - Tạo 10 specialties
  const specialtyData = [
    {
      name: 'Tim mạch',
      description: 'Chuyên khoa tim mạch, điều trị các bệnh lý về tim và mạch máu',
      images: [getRandomImage('medical'), getRandomImage('medical')],
      functions: ['Khám tim', 'Siêu âm tim', 'Điện tâm đồ', 'Đặt máy tạo nhịp tim'],
      slug: generateSlug('Tim mạch'),
      is_active: true
    },
    {
      name: 'Nội khoa',
      description: 'Chuyên khoa nội tổng hợp, điều trị các bệnh lý nội khoa',
      images: [getRandomImage('medical'), getRandomImage('medical')],
      functions: ['Khám tổng quát', 'Chẩn đoán', 'Điều trị nội khoa', 'Tư vấn sức khỏe'],
      slug: generateSlug('Nội khoa'),
      is_active: true
    },
    {
      name: 'Ngoại khoa',
      description: 'Chuyên khoa phẫu thuật, thực hiện các ca mổ',
      images: [getRandomImage('medical'), getRandomImage('medical')],
      functions: ['Phẫu thuật', 'Mổ cấp cứu', 'Phẫu thuật thẩm mỹ', 'Nội soi'],
      slug: generateSlug('Ngoại khoa'),
      is_active: true
    },
    {
      name: 'Sản phụ khoa',
      description: 'Chuyên khoa sản phụ khoa, chăm sóc sức khỏe phụ nữ',
      images: [getRandomImage('medical'), getRandomImage('medical')],
      functions: ['Khám thai', 'Sinh con', 'Điều trị phụ khoa', 'Tư vấn kế hoạch hóa gia đình'],
      slug: generateSlug('Sản phụ khoa'),
      is_active: true
    },
    {
      name: 'Nhi khoa',
      description: 'Chuyên khoa trẻ em, chăm sóc sức khỏe trẻ em',
      images: [getRandomImage('medical'), getRandomImage('medical')],
      functions: ['Khám trẻ em', 'Tiêm chủng', 'Điều trị bệnh nhi', 'Tư vấn dinh dưỡng'],
      slug: generateSlug('Nhi khoa'),
      is_active: true
    },
    {
      name: 'Da liễu',
      description: 'Chuyên khoa da liễu, điều trị các bệnh về da',
      images: [getRandomImage('medical'), getRandomImage('medical')],
      functions: ['Khám da', 'Điều trị mụn', 'Laser thẩm mỹ', 'Điều trị nấm da'],
      slug: generateSlug('Da liễu'),
      is_active: true
    },
    {
      name: 'Mắt',
      description: 'Chuyên khoa mắt, điều trị các bệnh lý về mắt',
      images: [getRandomImage('medical'), getRandomImage('medical')],
      functions: ['Khám mắt', 'Đo thị lực', 'Phẫu thuật mắt', 'Điều trị cận thị'],
      slug: generateSlug('Mắt'),
      is_active: true
    },
    {
      name: 'Tai mũi họng',
      description: 'Chuyên khoa tai mũi họng, điều trị các bệnh lý TMH',
      images: [getRandomImage('medical'), getRandomImage('medical')],
      functions: ['Khám TMH', 'Nội soi', 'Phẫu thuật TMH', 'Điều trị viêm xoang'],
      slug: generateSlug('Tai mũi họng'),
      is_active: true
    },
    {
      name: 'Thần kinh',
      description: 'Chuyên khoa thần kinh, điều trị các bệnh lý thần kinh',
      images: [getRandomImage('medical'), getRandomImage('medical')],
      functions: ['Khám thần kinh', 'Điện não đồ', 'Điều trị đột quỵ', 'Rehabilitative care'],
      slug: generateSlug('Thần kinh'),
      is_active: true
    },
    {
      name: 'Cơ xương khớp',
      description: 'Chuyên khoa cơ xương khớp, điều trị các bệnh lý về xương khớp',
      images: [getRandomImage('medical'), getRandomImage('medical')],
      functions: ['Khám xương khớp', 'Vật lý trị liệu', 'Phẫu thuật xương', 'Chữa gãy xương'],
      slug: generateSlug('Cơ xương khớp'),
      is_active: true
    }
  ];
  
  const specialties = await Specialty.insertMany(specialtyData);
  console.log('🏥 Đã tạo 10 specialties');

  // Doctor - Tạo 10 doctors với reference đúng
  const doctors = Array.from({ length: 10 }).map((_, index) => {
    const doctorNames = [
      'BS. Nguyễn Văn An', 'BS. Trần Thị Bình', 'BS. Lê Văn Cường', 'BS. Phạm Thị Dung',
      'BS. Hoàng Văn Em', 'BS. Vũ Thị Phương', 'BS. Đỗ Văn Giang', 'BS. Bùi Thị Hoa',
      'BS. Đinh Văn Khánh', 'BS. Ngô Thị Lan'
    ];
    const fullName = doctorNames[index];
    return {
      full_name: fullName,
      specialties: faker.helpers.arrayElement(specialties)._id, // Reference đúng ObjectId
      hospital: 'Bệnh viện Đa khoa Hospital',
      department: faker.helpers.arrayElement(['Khoa Nội', 'Khoa Ngoại', 'Khoa Sản', 'Khoa Nhi', 'Khoa Tim mạch']),
      degree: faker.helpers.arrayElement(['Tiến sĩ', 'Thạc sĩ', 'Bác sĩ chuyên khoa I', 'Bác sĩ chuyên khoa II']),
      description: `${fullName} là bác sĩ có nhiều năm kinh nghiệm trong lĩnh vực y khoa, tận tâm với nghề và luôn đặt bệnh nhân lên hàng đầu.`,
      experience: [
        `Hơn ${faker.number.int({ min: 5, max: 20 })} năm kinh nghiệm trong lĩnh vực chuyên khoa`,
        `Từng công tác tại ${faker.helpers.arrayElement(['BV Việt Đức', 'BV Bạch Mai', 'BV Chợ Rẫy', 'BV 108'])}`,
        'Tham gia nhiều chương trình đào tạo chuyên sâu trong và ngoài nước'
      ],
      certifications: [
        'Chứng chỉ hành nghề y khoa',
        'Chứng chỉ chuyên khoa cấp I',
        faker.helpers.arrayElement(['Chứng chỉ siêu âm', 'Chứng chỉ nội soi', 'Chứng chỉ phẫu thuật'])
      ],
      expertise_fields: [
        faker.helpers.arrayElement(['Điều trị nội khoa', 'Phẫu thuật', 'Chẩn đoán hình ảnh']),
        faker.helpers.arrayElement(['Cấp cứu', 'Tư vấn y khoa', 'Khám sức khỏe định kỳ'])
      ],
      training_process: [
        `Tốt nghiệp Đại học Y Hà Nội năm ${faker.date.past({ years: 15 }).getFullYear()}`,
        `Thực tập tại ${faker.helpers.arrayElement(['BV Việt Đức', 'BV Bạch Mai', 'BV K'])}`,
        'Tham gia các khóa đào tạo liên tục về chuyên môn'
      ],
      slug: generateSlug(fullName),
      avatar: getRandomImage('doctor'),
      phone_number: faker.helpers.replaceSymbols('0#########'),
      email: faker.internet.email(),
      work_address: 'Số 123 Đường ABC, Quận XYZ, Hà Nội',
      is_active: true
    };
  });
  await Doctor.insertMany(doctors);
  console.log('👨‍⚕️ Đã tạo 10 doctors');

  // Service - Tạo 10 services với reference đúng
  const services = Array.from({ length: 10 }).map((_, index) => {
    const serviceNames = [
      'Khám tổng quát', 'Siêu âm tim mạch', 'Xét nghiệm máu', 'Chụp X-quang',
      'Nội soi dạ dày', 'Phẫu thuật nội soi', 'Điều trị vật lý', 'Tư vấn dinh dưỡng',
      'Khám sức khỏe định kỳ', 'Cấp cứu 24/7'
    ];
    const serviceName = serviceNames[index];
    return {
      name: serviceName,
      specialties: faker.helpers.arrayElement(specialties)._id, // Reference đúng ObjectId
      description: `Dịch vụ ${serviceName.toLowerCase()} chất lượng cao với đội ngũ y bác sĩ giàu kinh nghiệm và trang thiết bị hiện đại.`,
      slug: generateSlug(serviceName),
      avatar: getRandomImage('medical'),
      images: [getRandomImage('medical'), getRandomImage('medical'), getRandomImage('healthcare')],
      features: [
        'Đội ngũ bác sĩ chuyên nghiệp',
        'Trang thiết bị hiện đại',
        'Quy trình chuẩn quốc tế',
        'Dịch vụ tận tâm'
      ],
      is_active: true
    };
  });
  await Service.insertMany(services);
  console.log('🏥 Đã tạo 10 services');

  // News - Tạo 10 news
  const newsData = Array.from({ length: 10 }).map((_, index) => {
    const newsTitles = [
      'Khám phá phương pháp điều trị tim mạch mới tại Hospital',
      'Chương trình khám sức khỏe miễn phí cho người cao tuổi',
      'Bệnh viện Hospital đạt chứng nhận chất lượng quốc tế',
      'Hội thảo y khoa về phòng chống bệnh tiểu đường',
      'Khánh thành khoa Nhi với trang thiết bị hiện đại',
      'Chiến dịch tiêm chủng mở rộng cho trẻ em',
      'Đội ngũ bác sĩ Hospital được đào tạo tại Nhật Bản',
      'Nghiên cứu mới về điều trị ung thư tại Hospital',
      'Triển khai dịch vụ khám bệnh từ xa qua video call',
      'Hospital nhận giải thưởng bệnh viện xuất sắc năm 2025'
    ];
    const newsTitle = newsTitles[index];
    return {
      title: newsTitle,
      slug: generateSlug(newsTitle),
      description: `Tin tức y tế quan trọng: ${newsTitle.toLowerCase()}.`,
      content: `
        <h2>${newsTitle}</h2>
        <p>Đây là một tin tức quan trọng trong lĩnh vực y tế. Bệnh viện Hospital luôn nỗ lực mang đến những dịch vụ y tế chất lượng cao nhất cho cộng đồng.</p>
        
        <h3>Chi tiết về sự kiện</h3>
        <p>Với sự đầu tư mạnh mẽ vào trang thiết bị y tế hiện đại và đội ngũ y bác sĩ giàu kinh nghiệm, Hospital cam kết mang đến những dịch vụ y tế tốt nhất.</p>
        
        <h3>Lợi ích cho cộng đồng</h3>
        <ul>
          <li>Nâng cao chất lượng chăm sóc sức khỏe</li>
          <li>Tiếp cận công nghệ y tế tiên tiến</li>
          <li>Giảm chi phí điều trị cho người bệnh</li>
          <li>Tăng cường phòng ngừa bệnh tật</li>
        </ul>
        
        <p>Để biết thêm thông tin chi tiết, quý khách hàng có thể liên hệ trực tiếp với bệnh viện qua hotline hoặc website chính thức.</p>
      `,
      image: getRandomImage('healthcare'),
      author: faker.helpers.arrayElement(['BS. Nguyễn Văn An', 'BS. Trần Thị Bình', 'PGS.TS Lê Văn Cường']),
      category: faker.helpers.arrayElement(['Tin tức', 'Sức khỏe', 'Công nghệ y tế', 'Dịch vụ mới']),
      tags: faker.helpers.arrayElements(['sức khỏe', 'y tế', 'bệnh viện', 'điều trị', 'khám bệnh', 'chăm sóc'], { min: 2, max: 4 }),
      publish_date: faker.date.past({ years: 1 }),
      is_active: true,
      view_count: faker.number.int({ min: 100, max: 5000 })
    };
  });
  await News.insertMany(newsData);
  console.log('📰 Đã tạo 10 news');

  // Introduce - Tạo 10 introduces
  const introduceData = Array.from({ length: 10 }).map((_, index) => {
    const introduceTitles = [
      'Giới thiệu về Bệnh viện Hospital',
      'Lịch sử phát triển của Hospital',
      'Sứ mệnh và tầm nhìn',
      'Đội ngũ y bác sĩ chuyên nghiệp',
      'Trang thiết bị y tế hiện đại',
      'Chính sách chăm sóc bệnh nhân',
      'Hoạt động vì cộng đồng',
      'Chứng nhận chất lượng quốc tế',
      'Văn hóa doanh nghiệp',
      'Cam kết phục vụ'
    ];
    const introduceTitle = introduceTitles[index];
    return {
      title: introduceTitle,
      slug: generateSlug(introduceTitle),
      short_description: `Tìm hiểu về ${introduceTitle.toLowerCase()} tại Bệnh viện Hospital.`,
      content: `
        <h2>${introduceTitle}</h2>
        <p>Hospital là một trong những bệnh viện hàng đầu tại Việt Nam, với hơn 20 năm kinh nghiệm trong lĩnh vực chăm sóc sức khỏe.</p>
        
        <h3>Thông tin chi tiết</h3>
        <p>Chúng tôi cam kết mang đến dịch vụ y tế chất lượng cao với đội ngũ y bác sĩ giàu kinh nghiệm và trang thiết bị y tế hiện đại nhất.</p>
        
        <h3>Giá trị cốt lõi</h3>
        <ul>
          <li>Chất lượng dịch vụ hàng đầu</li>
          <li>Sự tận tâm với bệnh nhân</li>
          <li>Đổi mới không ngừng</li>
          <li>Trách nhiệm xã hội</li>
        </ul>
      `,
      image: getRandomImage('healthcare'),
      is_active: true
    };
  });
  await Introduce.insertMany(introduceData);
  console.log('📋 Đã tạo 10 introduces');

  // Recruitment - Tạo 10 recruitments với reference đúng
  const recruitmentData = Array.from({ length: 10 }).map((_, index) => {
    const jobTitles = [
      'Bác sĩ Nội khoa',
      'Y tá chăm sóc đặc biệt',
      'Kỹ thuật viên X-quang',
      'Dược sĩ bệnh viện',
      'Bác sĩ Ngoại khoa',
      'Nhân viên lễ tân',
      'Kế toán y tế',
      'Bác sĩ Sản phụ khoa',
      'Kỹ thuật viên xét nghiệm',
      'Trưởng khoa Tim mạch'
    ];
    const jobTitle = jobTitles[index];
    return {
      title: `Tuyển dụng ${jobTitle}`,
      slug: generateSlug(jobTitle),
      position: jobTitle,
      specialty_id: faker.helpers.arrayElement(specialties)._id, // Reference đúng
      description: `Hospital đang tìm kiếm ${jobTitle} giàu kinh nghiệm để gia nhập đội ngũ y tế chuyên nghiệp của chúng tôi.`,
      requirements: [
        `Tốt nghiệp ${faker.helpers.arrayElement(['Đại học Y', 'Cao đẳng Y tế', 'Trung cấp Y tế'])}`,
        `Có ít nhất ${faker.number.int({ min: 1, max: 5 })} năm kinh nghiệm`,
        'Có chứng chỉ hành nghề',
        'Kỹ năng giao tiếp tốt',
        'Tinh thần trách nhiệm cao'
      ],
      benefits: [
        `Lương từ ${faker.number.int({ min: 10, max: 50 })} triệu VNĐ/tháng`,
        'Bảo hiểm y tế đầy đủ',
        'Thưởng cuối năm',
        'Đào tạo nâng cao tay nghề',
        'Môi trường làm việc chuyên nghiệp'
      ],
      deadline: faker.date.future({ years: 1 }),
      location: 'Hà Nội',
      contact_email: 'tuyendung@hospital.com',
      recruitment_count: faker.number.int({ min: 1, max: 5 }),
      expiry_date: faker.date.future({ years: 1 }),
      document: null
    };
  });
  await Recruitment.insertMany(recruitmentData);
  console.log('💼 Đã tạo 10 recruitments');

  // HealthConsultation - Tạo 10 health consultations với reference đúng
  const healthConsultationData = Array.from({ length: 10 }).map((_, index) => {
    const consultationTitles = [
      'Tư vấn sức khỏe tim mạch',
      'Hỏi đáp về bệnh tiểu đường',
      'Chăm sóc sức khỏe phụ nữ',
      'Dinh dưỡng cho trẻ em',
      'Phòng ngừa bệnh ung thư',
      'Chăm sóc sức khỏe người cao tuổi',
      'Tư vấn về vắc xin',
      'Sức khỏe tâm thần',
      'Phục hồi chức năng',
      'Y tế dự phòng'
    ];
    const consultationTitle = consultationTitles[index];
    return {
      title: consultationTitle,
      slug: generateSlug(consultationTitle),
      image: getRandomImage('healthcare'),
      description: `Dịch vụ ${consultationTitle.toLowerCase()} chuyên nghiệp với đội ngũ bác sĩ giàu kinh nghiệm.`,
      specialty_id: faker.helpers.arrayElement(specialties)._id,
      is_active: true
    };
  });
  await HealthConsultation.insertMany(healthConsultationData);
  console.log('💬 Đã tạo 10 health consultations');

  // Application - Tạo 10 applications
  const applicationData = Array.from({ length: 10 }).map((_, index) => {
    const vietnameseNames = [
      'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung',
      'Hoàng Văn Em', 'Vũ Thị Phương', 'Đỗ Văn Giang', 'Bùi Thị Hoa',
      'Đinh Văn Khánh', 'Ngô Thị Lan'
    ];
    return {
      name: vietnameseNames[index],
      email: faker.internet.email(),
      phone: faker.helpers.replaceSymbols('0#########'),
      coverLetter: `Tôi là ${vietnameseNames[index]}, có kinh nghiệm ${faker.number.int({ min: 1, max: 10 })} năm trong lĩnh vực y tế. Tôi mong muốn được gia nhập đội ngũ Hospital để có thể đóng góp kiến thức và kinh nghiệm của mình vào sự phát triển của bệnh viện.`,
      cvFileUrl: faker.helpers.arrayElement([
        '/uploads/cv/cv-nguyen-van-an.pdf',
        '/uploads/cv/cv-tran-thi-binh.pdf',
        null // Một số có thể không có CV
      ]),
      status: faker.helpers.arrayElement(['pending', 'approved', 'rejected']),
      createdAt: faker.date.past({ years: 1 })
    };
  });
  await Application.insertMany(applicationData);
  console.log('📝 Đã tạo 10 applications');

  // BackgroundBanner - Tạo 10 background banners
  const backgroundBannerData = Array.from({ length: 10 }).map((_, index) => {
    const bannerDescriptions = [
      'Banner trang chủ - Chào mừng đến với Hospital',
      'Banner dịch vụ y tế chất lượng cao',
      'Banner đội ngũ bác sĩ chuyên nghiệp',
      'Banner trang thiết bị hiện đại',
      'Banner chăm sóc sức khỏe toàn diện',
      'Banner khám sức khỏe định kỳ',
      'Banner dịch vụ cấp cứu 24/7',
      'Banner chăm sóc đặc biệt',
      'Banner y tế cộng đồng',
      'Banner cam kết chất lượng'
    ];
    return {
      image: getRandomImage('banner'),
      description: bannerDescriptions[index]
    };
  });
  await BackgroundBanner.insertMany(backgroundBannerData);
  console.log('🖼️  Đã tạo 10 background banners');

  console.log('🎉 Seed dữ liệu mẫu thành công!');
  console.log('📊 Tổng cộng:');
  console.log('   - 10 Users');
  console.log('   - 10 Specialties');
  console.log('   - 10 Doctors');
  console.log('   - 10 Services');
  console.log('   - 10 News');
  console.log('   - 10 Introduces');
  console.log('   - 10 Recruitments');
  console.log('   - 10 Health Consultations');
  console.log('   - 10 Applications');
  console.log('   - 10 Background Banners');
  process.exit();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});