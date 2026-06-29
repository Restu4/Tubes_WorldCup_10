const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const isVercel = process.env.VERCEL === '1';

let prisma;

if (isVercel) {
  const tmpDb = '/tmp/dev.db';
  if (!fs.existsSync(tmpDb)) {
    const srcDb = path.join(__dirname, '../../prisma/dev.db');
    if (fs.existsSync(srcDb)) {
      fs.copyFileSync(srcDb, tmpDb);
    }
  }
  process.env.DATABASE_URL = `file:${tmpDb}`;
}

prisma = new PrismaClient();

module.exports = prisma;