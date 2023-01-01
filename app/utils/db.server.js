import { PrismaClient } from "@prisma/client";

let db = PrismaClient;

// declare global {
//     var __db: PrismaClient | undefined;
// }

// if (process.env.NODE_ENV === "production") {
//     db = new PrismaClient();
//     db.$connect();
// } else {
//     if (!db) {
//         db = new PrismaClient();
//         db.$connect();
//     }
// }

// export { db };