import HealthInsuranceExam from '../../models/health-insurance-exam.model.js';

const create = async (data) => HealthInsuranceExam.create(data);
const findById = async (id) => HealthInsuranceExam.findById(id);

export default {
  create,
  findById
};
