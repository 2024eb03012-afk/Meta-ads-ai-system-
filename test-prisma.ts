import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
p.$connect().then(() => console.log('success')).catch(e => console.error(e));
