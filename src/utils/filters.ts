import type { Prisma } from "@prisma/client";

class FilterFeatures {
  private queryBuilder: Prisma.ProductDelegate["findMany"];
  private queryString: Record<string, string | string[]>;
  private queryOptions: Prisma.ProductFindManyArgs;

  constructor(queryBuilder: Prisma.ProductDelegate["findMany"], queryString: Record<string, string | string[]>) {
    this.queryBuilder = queryBuilder;
    this.queryString = queryString;
    this.queryOptions = {};
  }

  search() {
    if (this.queryString.keyword) {
      this.queryOptions.where = {
        ...this.queryOptions.where,
        name: {
          contains: this.queryString.keyword as string,
          mode: "insensitive", // Case-insensitive search
        },
      };
    }
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryString };

    // Removing fields that are not part of Prisma schema filters and append them to prisma query
    const removedFields = ["keyword", "limit", "page"];
    removedFields.forEach((field) => delete queryCopy[field]);

    // Filtering queries with gte | lte | gt | lt
    const filters: any = {};
    for (const key in queryCopy) {
      if (/\b(gt|gte|lt|lte)\b/.test(key)) {
        // If (gte | lte | gt | lt) are in query params then filt it otherwise don't
        const [field, operator] = key.split("_"); // Example: price_gte is split to be (field: price), (operator: gte)
        filters[field] = {
          ...filters[field],
          [operator]: Number(queryCopy[key]),
        };
      } else {
        filters[key] = queryCopy[key];
      }
    }

    this.queryOptions.where = { ...this.queryOptions.where, ...filters };
    return this;
  }

  pagination(perPage: number) {
    const currentPage = Number(this.queryString.page) || 1;
    const skip = perPage * (currentPage - 1);

    this.queryOptions.skip = skip;
    this.queryOptions.take = perPage;
    return this;
  }

  async execute() {
    return await this.queryBuilder(this.queryOptions);
  }
}

export default FilterFeatures;
