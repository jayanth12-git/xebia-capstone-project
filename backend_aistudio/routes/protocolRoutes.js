const express = require('express');
const router = express.Router();

const {
  createProtocol,
  getProtocol,
  listProtocols,
  updateProtocol,
  deleteProtocol,
  duplicateProtocol,
  getVersionHistory,
} = require('../controllers/protocolController');

const {
  createProtocolValidator,
  updateProtocolValidator,
  idParamValidator,
  listQueryValidator,
} = require('../validators/protocolValidators');

const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(listQueryValidator, validate, listProtocols)
  .post(createProtocolValidator, validate, createProtocol);

router.route('/:id')
  .get(idParamValidator, validate, getProtocol)
  .put(updateProtocolValidator, validate, updateProtocol)
  .delete(idParamValidator, validate, deleteProtocol);

router.post('/:id/duplicate', idParamValidator, validate, duplicateProtocol);
router.get('/:id/versions', idParamValidator, validate, getVersionHistory);

module.exports = router;
