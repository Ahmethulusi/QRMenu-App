
// routes/branches.js (veya uygun controller içinde)
const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');
const BranchProduct = require('../models/BranchProduct');
const Product = require('../models/Products');
const Business = require('../models/Business');



exports.getProductsByBranchId= async (req, res) => {
  const { branchId } = req.params;

  try {
    const branch = await Branch.findByPk(branchId, {
      include: {
        model: BranchProduct,
        include: {
          model: Product,
        },
      },
    });

    if (!branch) {
      return res.status(404).json({ message: 'Şube bulunamadı' });
    }

    // İstiyorsan sadece ürünleri döndür:
    const products = branch.BranchProducts.map(bp => ({
      id: bp.Product.id,
      name: bp.Product.product_name,
      description: bp.Product.description,
      price: bp.price,
      stock: bp.stock,
    }));

    return res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};



// controllers/businessController.js

exports.getBusinessDetailsWithProducts = async (req, res) => {
  const { businessId } = req.params;

  try {
    const business = await Business.findByPk(businessId, {
      include: [
        {
          model: Branch,
          include: [
            {
              model: BranchProduct,
              include: [
                {
                  model: Product,
                  attributes: ['product_id', 'product_name', 'description', 'price'],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!business) {
      return res.status(404).json({ message: 'İşletme bulunamadı' });
    }

    return res.json(business);
  } catch (error) {
    console.error('HATA:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
};


exports.getAllBranchesByBusinessId = async (req, res) => {
    try {
      const { businessId } = req.params;
      console.log('📦 Gelen parametre:', req.params);

      if (!businessId) {
        return res.status(400).json({ error: 'business_id parametresi gerekli' });
      }
  
      const branches = await Branch.findAll({
        where: { business_id:businessId },
        attributes: ['id', 'name'],
        order: [['id', 'ASC']],
      });
  
      res.json(branches);
    } catch (err) {
      console.error('Şubeler alınamadı:', err);
      res.status(500).json({ error: 'Şubeler alınamadı' });
    }
  };
  

