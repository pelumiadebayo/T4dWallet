import mongoose from "mongoose";

export const paginate = async <T>(
    model: mongoose.Model<T>,
    query: object,
    options: {
      page: number;
      limit: number;
      sort?: string | { [key: string]: mongoose.SortOrder } | [string, mongoose.SortOrder][];
    }
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const { page, limit, sort = { createdAt: -1 } } = options;
  
    const skip = (page - 1) * limit;
    const total = await model.countDocuments(query);
    const data = await model
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
};