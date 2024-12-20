import prisma from "@/config/prisma";
import cloudinary from "@/middleware/imagesUpload";
import FilterFeatures from "@/utils/filters";
import { ServiceResponse } from "@/utils/serviceResponse";
import type { Product, User } from "@prisma/client";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ErrorHandler, asyncCatch } from "../../middleware/errorHandler";

class ProductController {
  public getProducts: RequestHandler = asyncCatch(async (_req: Request, res: Response, next: NextFunction) => {
    const products = await prisma.product.findMany({
      include: {
        images: {
          select: {
            id: true,
            public_id: true,
            url: true,
          },
        },
      },
    });

    if (!products || products.length === 0) {
      return next(ErrorHandler.NotFound("No Products found"));
    }

    return ServiceResponse.success<Product[]>("List of All Products", products, res);
  });

  public getProduct: RequestHandler = asyncCatch(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const product = await prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      return next(ErrorHandler.BadRequest("No product found with that ID"));
    }

    return ServiceResponse.success<Product>("Product details fetched!", product, res);
  });

  public insertProduct: RequestHandler = asyncCatch(async (req: Request, res: Response, next: NextFunction) => {
    req.body.user = (req.user as User).id;

    // Generate Links for product image
    const imageLinks: { public_id: string; url: string }[] = [];

    if (req.files) {
      // Type guard to check if files is an array
      const filesArray = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();

      for (const file of filesArray) {
        const result = await cloudinary.v2.uploader.upload(file.path, {
          folder: "imc-platform",
        });

        imageLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
    }

    const product = await prisma.product.create({
      data: {
        ...req.body,
        stock: Number(req.body.stock),
        images: { create: imageLinks },
        user: {
          connect: {
            id: req.body.user,
          },
        },
      },
    });

    return ServiceResponse.success<Product>("Product Created Successful!", product, res);
  });

  public updateProduct: RequestHandler = asyncCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { update_id: id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return next(ErrorHandler.BadRequest("No product found with that ID"));
    }

    // Generate Links for product image
    const imageLinks: { public_id: string; url: string }[] = [];

    if (req.files) {
      const images = await prisma.image.findMany({ where: { productId: id } });

      for (const image of images) {
        // Delete Existing images from cloudinary
        await cloudinary.v2.uploader.destroy(image.public_id);
      }

      // Delete existing images from database
      await prisma.image.deleteMany({ where: { productId: id } });

      // Type guard to check if files is an array
      const filesArray = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();

      for (const file of filesArray) {
        const result = await cloudinary.v2.uploader.upload(file.path, {
          folder: "imc-platform",
        });

        imageLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
    }

    const updateProduct = await prisma.product.update({
      where: { id },
      data: {
        ...req.body,
        stock: Number(req.body.stock),
        images: { create: imageLinks },
      },
    });

    return ServiceResponse.success<Product>("Product Updated successful!", updateProduct, res);
  });

  public deleteProduct: RequestHandler = asyncCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { delete_id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: delete_id },
    });

    if (!product) {
      return next(ErrorHandler.NotFound("No product found with that ID"));
    }

    await prisma.product.delete({ where: { id: delete_id } });

    return ServiceResponse.success("Product Deleted Successful!", null, res, StatusCodes.OK);
  });

  public filterProducts: RequestHandler = asyncCatch(async (req: Request, res: Response, next: NextFunction) => {
    const perPage = 8;
    const productsCount = await prisma.product.count();

    const apiFeatures = new FilterFeatures(prisma.product.findMany.bind(prisma.product), req.query as any)
      .search()
      .filter()
      .pagination(perPage);

    const products = await apiFeatures.execute();

    res.status(200).json({
      success: true,
      counts: products.length,
      responseObject: products,
      productsCount,
      resultPerPage: perPage,
      filteredProductsCount: products.length,
    });
    // return ServiceResponse.success("Product Deleted Successful!", null, res, StatusCodes.OK);
  });
}

export const productController = new ProductController();
