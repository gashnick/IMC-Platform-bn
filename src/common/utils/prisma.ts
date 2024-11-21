// import { Pool, neonConfig } from '@neondatabase/serverless'
// import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
// import ws from 'ws';
import dotenv from "dotenv";

dotenv.config()

const prismaClientSingleton = ()=> {
    // const connectionString = `${process.env.DATABASE_URL}`;
    // neonConfig.webSocketConstructor = ws
    // const pool = new Pool({ connectionString })
    // const adapter = new PrismaNeon(pool)
    // const prisma = new PrismaClient({ adapter })

    const prisma = new PrismaClient()

    return prisma;
}

declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientSingleton>;
  } & typeof global;
  
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma