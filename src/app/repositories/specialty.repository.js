import BaseRepository from './base.repository.js';
import Specialty from '../../models/specialty.model.js';

class SpecialtyRepository extends BaseRepository {
  constructor() {
    super(Specialty);
  }

  async findBySlug(slug) {
    return await this.findOne({ slug });
  }

  async findActiveSpecialties() {
    return await this.find({ is_active: true }, { sort: { name: 1 } });
  }

  async findWithDoctorCount(specialtyId) {
    // Sử dụng aggregate để đếm số bác sĩ
    const result = await this.model.aggregate([
      { $match: { _id: specialtyId } },
      {
        $lookup: {
          from: 'doctors',
          localField: '_id',
          foreignField: 'specialties',
          as: 'doctors'
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          images: 1,
          functions: 1,
          slug: 1,
          is_active: 1,
          doctorCount: { $size: '$doctors' }
        }
      }
    ]);
    return result[0] || null;
  }

  async checkSpecialtyInUse(specialtyId) {
    // Kiểm tra xem specialty có đang được sử dụng bởi doctors, services, health-consultations không
    const { default: Doctor } = await import('../../models/doctor.model.js');
    const { default: Service } = await import('../../models/service.model.js');
    const { default: HealthConsultation } = await import('../../models/health-consultation.model.js');

    const [doctorCount, serviceCount, consultationCount] = await Promise.all([
      Doctor.countDocuments({ specialties: specialtyId }),
      Service.countDocuments({ specialties: specialtyId }),
      HealthConsultation.countDocuments({ specialty_id: specialtyId, is_active: true })
    ]);

    return {
      inUse: doctorCount > 0 || serviceCount > 0 || consultationCount > 0,
      details: {
        doctors: doctorCount,
        services: serviceCount,
        consultations: consultationCount
      }
    };
  }
}

export default new SpecialtyRepository();
