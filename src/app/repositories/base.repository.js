class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return await this.model.create(data);
  }

  async findById(id, populate = null) {
    const query = this.model.findById(id);
    if (populate) {
      query.populate(populate);
    }
    return await query;
  }

  async findOne(conditions, populate = null) {
    const query = this.model.findOne(conditions);
    if (populate) {
      query.populate(populate);
    }
    return await query;
  }

  async find(conditions = {}, options = {}) {
    const { populate, select, sort, limit, skip } = options;
    let query = this.model.find(conditions);

    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    if (skip) query = query.skip(skip);

    return await query;
  }

  async updateById(id, data, options = { new: true, runValidators: true }) {
    return await this.model.findByIdAndUpdate(id, data, options);
  }

  async deleteById(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async count(conditions = {}) {
    return await this.model.countDocuments(conditions);
  }

  async exists(conditions) {
    return await this.model.exists(conditions);
  }
}

export default BaseRepository;
