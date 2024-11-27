import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ServiceResponse } from "@/utils/serviceResponse";
import { asyncCatch, ErrorHandler } from '../../middleware/errorHandler';
import prisma from "@/utils/prisma";
import { StatusCodes } from "http-status-codes";
import { Product } from "@prisma/client";

class ProductController {
    public getProducts: RequestHandler = asyncCatch(async (_req: Request, res: Response, next: NextFunction) => {
        const products = await prisma.product.findMany({});

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


    public updateProduct: RequestHandler = asyncCatch(async (req: Request, res: Response, next: NextFunction) => {
        const { update_id: id } = req.params;

        const product = await prisma.product.update({ 
            where: { id },
            data: { ...req.body },
        });

        if (!product) {
            return next(ErrorHandler.NotFound("No product found with that ID"));
        }
        
        return ServiceResponse.success<Product>("Product details fetched!", product, res);
    });

    public deleteProduct: RequestHandler = asyncCatch(async (req: Request, res: Response, next: NextFunction) => {
        const { delete_id } = req.params;

        const product = await prisma.product.findUnique({ 
            where: { id: delete_id },
        });

        if (!product) {
            return next(ErrorHandler.NotFound("No product found with that ID"));
        }

        await prisma.product.delete({ where: { id: delete_id }});
        
        return ServiceResponse.success("Product Deleted Successful!", null, res, StatusCodes.OK);
    });
}

export const productController = new ProductController();
