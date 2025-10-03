const { Label, Branch, Product, ProductLabel } = require('../models');

/**
 * Label Controller
 * Etiket işlemlerini yöneten controller
 */
class LabelController {

  /**
   * Şubeye ait aktif etiketleri getir
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getBranchLabels = async (req, res) => {
    const { branchId } = req.params;
    const { lang = 'tr', business_id } = req.query;

    try {
      // Şube var mı kontrol et
      const branch = await Branch.findByPk(branchId);
      if (!branch) {
        return res.status(404).json({
          success: false,
          message: 'Şube bulunamadı',
          code: 'BRANCH_NOT_FOUND'
        });
      }

      // Business ID'yi belirle (query'den veya şube üzerinden)
      const targetBusinessId = business_id ? parseInt(business_id) : branch.business_id;
      
      // Şubeye ait kategorilerdeki ürünlerde kullanılan etiketleri getir
      const labels = await Label.findAll({
        where: {
          business_id: targetBusinessId,
          is_active: true
        },
        include: [
          {
            model: Product,
            as: 'products',
            where: { 
              is_active: true,
              is_available: true
            },
            required: true, // Sadece ürünü olan etiketleri getir
            through: {
              model: ProductLabel,
              attributes: []
            },
            attributes: ['product_id'] // Sadece ID'yi al, tüm ürün bilgilerini değil
          }
        ],
        attributes: ['label_id', 'name', 'description', 'color'],
        order: [['name', 'ASC']]
      });

      // Etiketleri formatla
      const formattedLabels = labels.map(label => ({
        id: label.label_id,
        name: label.name,
        description: label.description,
        color: label.color,
        productCount: label.products ? label.products.length : 0
      }));

      res.json({
        success: true,
        data: {
          branch_id: branchId,
          business_id: targetBusinessId,
          language: lang,
          labels: formattedLabels,
          total_count: formattedLabels.length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Etiketler yükleme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Etiketler yüklenirken hata oluştu',
        error: error.message
      });
    }
  }

  /**
   * Belirli bir etikete ait ürünleri getir
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getLabelProducts = async (req, res) => {
    const { branchId, labelId } = req.params;
    const { lang = 'tr', business_id } = req.query;

    try {
      // Şube var mı kontrol et
      const branch = await Branch.findByPk(branchId);
      if (!branch) {
        return res.status(404).json({
          success: false,
          message: 'Şube bulunamadı'
        });
      }

      // Business ID'yi belirle (query'den veya şube üzerinden)
      const targetBusinessId = business_id ? parseInt(business_id) : branch.business_id;
      
      // Etiket var mı kontrol et
      const label = await Label.findOne({
        where: {
          label_id: labelId,
          business_id: targetBusinessId,
          is_active: true
        }
      });

      if (!label) {
        return res.status(404).json({
          success: false,
          message: 'Etiket bulunamadı'
        });
      }

      // Bu etikete sahip ürünleri getir
      const products = await Product.findAll({
        where: { 
          is_active: true,
          is_available: true
        },
        include: [
          {
            model: Label,
            as: 'labels',
            where: { label_id: labelId },
            through: {
              model: ProductLabel,
              attributes: []
            },
            attributes: ['label_id', 'name', 'color']
          }
        ],
        attributes: ['product_id', 'product_name', 'description', 'price', 'currency_code', 'image_url', 'sira_id', 'is_available'],
        order: [['sira_id', 'ASC']]
      });

      res.json({
        success: true,
        data: {
          branch_id: branchId,
          business_id: targetBusinessId,
          label_id: labelId,
          language: lang,
          label: {
            id: label.label_id,
            name: label.name,
            description: label.description,
            color: label.color
          },
          products: products.map(product => ({
            id: product.product_id,
            name: product.product_name,
            description: product.description,
            price: product.price,
            currency: product.currency_code,
            image_url: product.image_url,
            order: product.sira_id,
            is_available: product.is_available
          })),
          total_count: products.length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Etiket ürünleri yükleme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Etiket ürünleri yüklenirken hata oluştu',
        error: error.message
      });
    }
  }
}

module.exports = new LabelController();
