const prisma = require('../utils/prisma');

async function findFirst() {
  return prisma.admin.findFirst();
}

module.exports = { findFirst };
