const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const PRODUCTS_FILE = './data/products.json';

const readProductsFile = () => {
  const data = fs.readFileSync(PRODUCTS_FILE);
  return JSON.parse(data);
};

const writeProductsFile = (data) => {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2));
};

router.get('/', (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
  const products = readProductsFile();
  res.json(limit ? products.slice(0, limit) : products);
});

router.get('/:pid', (req, res) => {
  const products = readProductsFile();
  const product = products.find(p => p.id === req.params.pid);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

router.post('/', (req, res) => {
  const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;
  if (!title || !description || !code || !price || stock === undefined || !category) {
    return res.status(400).json({ message: 'All fields except thumbnails are required' });
  }
  const newProduct = { id: uuidv4(), title, description, code, price, status, stock, category, thumbnails };
  const products = readProductsFile();
  products.push(newProduct);
  writeProductsFile(products);
  res.status(201).json(newProduct);
});

router.put('/:pid', (req, res) => {
  const products = readProductsFile();
  const productIndex = products.findIndex(p => p.id === req.params.pid);
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  const updatedProduct = { ...products[productIndex], ...req.body };
  products[productIndex] = updatedProduct;
  writeProductsFile(products);
  res.json(updatedProduct);
});

router.delete('/:pid', (req, res) => {
  const products = readProductsFile();
  const newProducts = products.filter(p => p.id !== req.params.pid);
  if (products.length === newProducts.length) {
    return res.status(404).json({ message: 'Product not found' });
  }
  writeProductsFile(newProducts);
  res.status(204).send();
});

module.exports = router;
