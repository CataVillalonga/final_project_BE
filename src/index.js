import express from 'express';
import dotenv from 'dotenv';
const env = dotenv.config().parsed;
import { getCategories, getCart, postCart, updateCart, deleteProduct, deleteCart } from './mongodb.js';

const app = express();
console.log(env.port)
const port = env.port;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// category routes
app.route('/api/products')
  .get(async (req, res) => {
    const allCategories = await getCategories();
    res
      .json(allCategories)
      .status(200)
      .end();
  })

//cart routes
app.route('/api/carts')
  .get(async (req, res) => {
    const cart = await getCart(req.body.username);
    if (cart.length === 0 ) {
      return res
      .json({})
      .status(200)
      .end();
    }
    return res
    .json(cart)
    .status(200)
    .end();
  })
  .post(async (req, res) => {
    let cart = await getCart(req.body.username);
    if (cart.length === 0) {
      await postCart(req.body.username, req.body.products)
      cart = await getCart(req.body.username);
      return res
      .json(cart)
      .status(201)
      .end();
    }
    await updateCart(req.body.username, req.body.products);
    cart = await getCart(req.body.username);
    return res
    .json(cart)
    .status(200)
    .end();
  })
  .patch(async (req, res) => {
    await deleteProduct(req.body.username, req.body.products);
    const cart = await getCart(req.body.username);
    return res
    .json(cart)
    .status(200)
    .end();
  })
  .delete(async (req, res) => {
    await deleteCart(req.body.username);
    await getCart(req.body.username);
    return res
    .json()
    .status(200)
    .end();
  })
app.route('/api/carts/:username')
.get(async (req, res) => {
  const name =req.params.username;
  const cart = await getCart(name);
  return res
  .json(cart)
  .status(200)
  .end();
})
//account routes

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
