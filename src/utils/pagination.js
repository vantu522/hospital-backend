/**
 * Utility function for pagination
 * @param {Object} model - Mongoose model
 * @param {Object} query - Query conditions
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {Object} options.sort - Sort options (default: { createdAt: -1 })
 * @param {string|Object} options.populate - Populate fields
 * @param {string|Object} options.select - Select specific fields
 * @returns {Object} Paginated result with data and pagination info
 */
export const paginate = async (model, query = {}, options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
      populate = null,
      select = null
    } = options;

    // Validate page and limit
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit))); // Max 100 items per page
    const skip = (pageNum - 1) * limitNum;

    // Build the query
    let mongoQuery = model.find(query);

    // Apply select if provided
    if (select) {
      mongoQuery = mongoQuery.select(select);
    }

    // Apply populate if provided
    if (populate) {
      mongoQuery = mongoQuery.populate(populate);
    }

    // Apply sort and pagination
    mongoQuery = mongoQuery.sort(sort).skip(skip).limit(limitNum);

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      mongoQuery.exec(),
      model.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    return {
      success: true,
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? pageNum + 1 : null,
        prevPage: hasPrevPage ? pageNum - 1 : null
      }
    };

  } catch (error) {
    throw new Error(`Pagination error: ${error.message}`);
  }
};

/**
 * Extract pagination parameters from request query
 * @param {Object} reqQuery - Express request query object
 * @returns {Object} Pagination options
 */
export const getPaginationParams = (reqQuery) => {
  const page = parseInt(reqQuery.page) || 1;
  const limit = parseInt(reqQuery.limit) || 10;
  const sortField = reqQuery.sortBy || 'createdAt';
  const sortOrder = reqQuery.sortOrder === 'asc' ? 1 : -1;
  
  const sort = { [sortField]: sortOrder };

  return {
    page,
    limit,
    sort
  };
};
