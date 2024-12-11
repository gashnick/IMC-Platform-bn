import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ServiceResponse } from "@/utils/serviceResponse";
import { asyncCatch, ErrorHandler } from '../../middleware/errorHandler';
import prisma from "@/config/prisma";
import { StatusCodes } from "http-status-codes";
import cloudinary from "@/middleware/imagesUpload";
import { Cart, Product, User } from "@prisma/client";

class CartController {
    public getCarts: RequestHandler = asyncCatch(async (req: Request, res: Response, next: NextFunction) => {
        const carts = await prisma.cart.findMany({
            where: {
                userId: (req.user as User).id
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        category: true,
                        location: true,
                        price: true,
                        numberOfReviews: true,
                        productionType: true,
                        stock: true,
                        images: {
                            select: {
                                public_id: true,
                                url: true
                            }
                        }
                    }
                },
                user: {
                    select: {
                        id: true,
                        address: true,
                        email: true,
                        name: true,
                        user_type: true
                    }
                }
            }      
        });

        if (!carts || carts.length === 0) {
            return next(ErrorHandler.NotFound("No Cart Items found"));
        }

        return ServiceResponse.success<Cart[]>("List of All Carts Items for LoggedIn user.", carts, res);
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

    public addToCart: RequestHandler = asyncCatch(async (req: Request, res: Response, next: NextFunction) => {
        
        const userId = (req.user as User).id;

        const { quantity, priceAtAddition, status, totalPrice } = req.body;

        const cart = await prisma.cart.create({ data: { 
                quantity,
                priceAtAddition,
                status,
                totalPrice,
                user: {
                    connect: {
                        id: userId
                    }
                },
                product: {
                    connect: {
                        id: req.body.productId
                    }
                }
            }  
        });
        
        return ServiceResponse.success<Cart>("Product Added to cart Successful!", cart, res);
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
            const images = await prisma.image.findMany({ where: { productId: id}})

            for ( let image of images ){
                // Delete Existing images from cloudinary
                await cloudinary.v2.uploader.destroy(image.public_id)
            }

            // Delete existing images from database
            await prisma.image.deleteMany({ where: { productId: id }})

            // Type guard to check if files is an array
            const filesArray = Array.isArray(req.files) 
                ? req.files 
                : Object.values(req.files).flat();

            for (const file of filesArray) {
                const result = await cloudinary.v2.uploader.upload(file.path, {
                    folder: "imc-platform"
                });

                imageLinks.push({
                    public_id: result.public_id,
                    url: result.secure_url
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

        await prisma.product.delete({ where: { id: delete_id }});
        
        return ServiceResponse.success("Product Deleted Successful!", null, res, StatusCodes.OK);
    });
}

export const cartController = new CartController();
