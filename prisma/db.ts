import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
    // log: [
    //   {
    //     emit: 'event',
    //     level: 'query',
    //   },
    //   {
    //     emit: 'stdout',
    //     level: 'error',
    //   },
    //   {
    //     emit: 'stdout',
    //     level: 'info',
    //   },
    //   {
    //     emit: 'stdout',
    //     level: 'warn',
    //   },
    // ],
  })
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const db = globalThis.prismaGlobal ?? prismaClientSingleton();

export default db;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = db;

// db.$on('query', (e) => {
//   console.log('Query: ' + e.query)
//   console.log('Params: ' + e.params)
//   console.log('Duration: ' + e.duration + 'ms')
// })