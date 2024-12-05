const express = require("express");

const router = express.Router();

const db = require("../util/db.js");

const ordersCol = db.collection("orders");
const PurchasesCol = db.collection("purchases");
const ProductsCol = db.collection("products");
const ChargesCol = db.collection("charges");
const StaticsCol = db.collection("statics");

router.post("/set_order", (req, res, next) => {
  const data = req.body;
  console.log(data);
  ordersCol.insertOne(data);
  res.json({ message: "order successfully added!!!!!" });
});

router.get("/get_orders", async (req, res, next) => {
  const orders = await ordersCol.find().toArray();
  res.json({ orders });
});

router.post(`/handle_order/:orderState`, (req, res, next) => {
  const order = req.body.order;
  const state = req.params.orderState;
  PurchasesCol.updateOne({ type: state }, { $push: { orders: order } });
  ordersCol.deleteOne({ id: order.id });
  if (state === "successed") {
    const products = order.products;
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      ProductsCol.updateOne(
        { name: product.name, weight: product.weight },
        { $inc: { remained: -product.quantity } }
      );
    }
  }
  res.json({ message: "order handled !!!!" });
});

router.get("/get-purchases", async (req, res, next) => {
  const purchases = await PurchasesCol.find().toArray();
  res.json({ purchases });
});

router.get("/get-products", async (req, res, next) => {
  const products = await ProductsCol.find().toArray();
  res.json(products);
});

router.post("/set-product", (req, res, next) => {
  const product = req.body;
  ProductsCol.insertOne(product);
  res.json({ message: "product successfully added !!!" });
});

router.post("/set-charge", async (req, res, next) => {
  const charge = req.body;
  const products = charge.products;
  ChargesCol.insertOne(charge);
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    ProductsCol.updateOne(
      { name: product.name, weight: product.weight },
      { $inc: { stock: product.quantity, remained: product.quantity } }
    );
  }
  StaticsCol.updateOne(
    { name: "سعر الشحنات" },
    { $inc: { value: charge.totalPrice } }
  );
  let totalClientPrice = 0;
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const productClientPrice = +(
      await ProductsCol.findOne({ name: product.name, weight: product.weight })
    ).price;
    totalClientPrice += productClientPrice * product.quantity;
  }
  StaticsCol.updateOne(
    { name: "الربح" },
    { $inc: { value: totalClientPrice } }
  );
  StaticsCol.updateOne(
    { name: "صافي الربح" },
    { $inc: { value: totalClientPrice - charge.totalPrice } }
  );
  res.json({ message: "charge added successfully !!!" });
});

router.get("/get-charges", async (req, res, next) => {
  const charges = await ChargesCol.find().toArray();
  res.json(charges);
});

router.post("/handle_total_purchases", (req, res, next) => {
  const client_price = req.body.client_price;
  const products_price = req.body.products_price;
  const extra_costs = req.body.extra_costs;
  console.log(client_price);
  console.log(products_price);
  console.log(extra_costs);
  StaticsCol.updateOne(
    { name: "إجمالي المبيعات" },
    { $inc: { value: client_price } }
  );
  StaticsCol.updateOne(
    { name: "إجمالي المشتريات" },
    { $inc: { value: products_price } }
  );
  StaticsCol.updateOne(
    { name: "تكاليف زائدة" },
    { $inc: { value: extra_costs } }
  );
  StaticsCol.updateOne(
    { name: "رأس المال" },
    { $inc: { value: client_price - products_price + extra_costs } }
  );
});

router.get("/get-statics", async (req, res, next) => {
  const statics = await StaticsCol.find().toArray();
  res.json(statics);
});
module.exports = router;
