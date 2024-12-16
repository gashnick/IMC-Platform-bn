import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prismaClientSingleton = () => {
  const prisma = new PrismaClient();
  return prisma;
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
