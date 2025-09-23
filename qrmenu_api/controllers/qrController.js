const { Op } = require('sequelize');
const { QRCode, Branch, Table } = require('../models');

/**
 * QR Controller
 * QR kod işlemlerini yöneten controller
 */
class QRController {
  
  /**
   * QR kod doğrulama
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  validateQRCode = async (req, res) => {
    const { qrCode } = req.params;

    // URL decode işlemi (eğer encode edilmişse)
    const decodedQrCode = decodeURIComponent(qrCode);

    // QR kodunu veritabanında ara (hem orijinal hem de decode edilmiş versiyonu dene)
    const qrData = await QRCode.findOne({
      where: {
        [Op.or]: [
          { qr_url: qrCode },
          { qr_url: decodedQrCode }
        ],
        is_active: true
      },
      include: [
        {
          model: Branch,
          as: 'Branch',
          attributes: ['id', 'name', 'adress', 'business_id']
        },
        {
          model: Table,
          as: 'Table',
          attributes: ['id', 'table_no', 'section_id'],
          required: false // Table opsiyonel olabilir
        }
      ]
    });

    if (!qrData) {
      return res.status(404).json({
        success: false,
        message: 'QR kod bulunamadı veya aktif değil',
        code: 'QR_NOT_FOUND'
      });
    }

    // Response data
    const responseData = {
      success: true,
      data: {
        qr_id: qrData.id,
        type: qrData.type,
        branch: qrData.Branch ? {
          id: qrData.Branch.id,
          name: qrData.Branch.name,
          address: qrData.Branch.adress,
          business_id: qrData.Branch.business_id
        } : null,
        table: qrData.Table ? {
          id: qrData.Table.id,
          table_no: qrData.Table.table_no,
          section_id: qrData.Table.section_id
        } : null,
        menu_url: `/api/menu/${qrData.branch_id}`, // Menü URL'i
        timestamp: new Date().toISOString()
      }
    };

    res.json(responseData);
  }

  /**
   * QR kod detaylarını getir (debug amaçlı)
   * @param {Object} req - Request object  
   * @param {Object} res - Response object
   */
  getQRCodeDetails = async (req, res) => {
    const { qrCode } = req.params;
    const decodedQrCode = decodeURIComponent(qrCode);

    const qrData = await QRCode.findOne({
      where: {
        [Op.or]: [
          { qr_url: qrCode },
          { qr_url: decodedQrCode }
        ]
      },
      include: [
        {
          model: Branch,
          as: 'Branch',
          attributes: ['id', 'name', 'adress', 'business_id']
        },
        {
          model: Table,
          as: 'Table',
          attributes: ['id', 'table_no', 'section_id'],
          required: false
        }
      ]
    });

    if (!qrData) {
      return res.status(404).json({
        success: false,
        message: 'QR kod bulunamadı',
        code: 'QR_NOT_FOUND_DEBUG'
      });
    }

    res.json({
      success: true,
      data: qrData,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new QRController();
