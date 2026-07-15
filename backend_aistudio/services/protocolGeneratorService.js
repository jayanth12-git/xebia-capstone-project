const { prisma } = require('../config/db');
const { generateProtocolDocument } = require('../utils/protocolTemplates');
const ApiError = require('../utils/ApiError');

/**
 * Accepts a complete protocol form, generates a structured protocol
 * document using predefined templates, and stores the generated
 * output as a Report (type FULL_PROTOCOL) linked to the protocol
 * (if a protocolId is supplied) or returns it standalone.
 */
async function generateAndStore(formData, userId) {
  const generatedDocument = generateProtocolDocument(formData);

  if (formData.protocolId) {
    const protocol = await prisma.protocol.findUnique({ where: { id: formData.protocolId } });
    if (!protocol) throw ApiError.notFound('Protocol not found for the supplied protocolId');

    const report = await prisma.report.create({
      data: {
        protocolId: formData.protocolId,
        type: 'FULL_PROTOCOL',
        format: 'JSON',
        content: generatedDocument,
        generatedById: userId,
      },
    });

    return { generatedDocument, savedReportId: report.id };
  }

  return { generatedDocument, savedReportId: null };
}

module.exports = { generateAndStore };
