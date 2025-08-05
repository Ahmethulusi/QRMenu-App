
const QRCode = require('../models/QRCode');

// List all QRs for a business, optionally filter by branch or table
exports.getQRCodes = async (req, res) => {
  const { business_id, branch_id, table_id, type } = req.query;
  const where = {};
  if (business_id) where.business_id = business_id;
  if (branch_id) where.branch_id = branch_id;
  if (table_id) where.table_id = table_id;
  if (type) where.type = type;
  try {
    const qrCodes = await QRCode.findAll({
      where,
      order: [['id', 'DESC']],
    });
    res.json(qrCodes);
  } catch (error) {
    res.status(500).json({ error: 'QR kodları alınamadı' });
  }
};

// Update getAllQRCodes to use the new getQRCodes logic for backward compatibility
exports.getAllQRCodes = async (req, res) => {
  req.query = req.query || {};
  return exports.getQRCodes(req, res);
};

exports.getQRCodeById = async (req, res) => {
  try {
    const qrCode = await QRCode.findByPk(req.params.id);
    if (!qrCode) return res.status(404).json({ error: 'QR bulunamadı' });
    res.json(qrCode);
  } catch (error) {
    res.status(500).json({ error: 'QR getirilemedi' });
  }
};

exports.deleteQRCode = async (req, res) => {
  try {
    const deleted = await QRCode.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'QR bulunamadı' });
    res.json({ message: 'QR silindi' });
  } catch (error) {
    res.status(500).json({ error: 'Silme işlemi başarısız' });
  }
};






