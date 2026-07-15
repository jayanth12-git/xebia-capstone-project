const { prisma } = require('../config/db');
const ApiError = require('../utils/ApiError');

async function getAllSettings() {
  return prisma.setting.findMany({ orderBy: { key: 'asc' } });
}

async function getSettingByKey(key) {
  const setting = await prisma.setting.findUnique({ where: { key } });
  if (!setting) throw ApiError.notFound(`Setting "${key}" not found`);
  return setting;
}

async function upsertSetting(key, value, description) {
  return prisma.setting.upsert({
    where: { key },
    update: { value, ...(description !== undefined ? { description } : {}) },
    create: { key, value, description },
  });
}

module.exports = { getAllSettings, getSettingByKey, upsertSetting };
