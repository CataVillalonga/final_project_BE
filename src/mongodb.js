import { MongoClient } from 'mongodb';

const url = process.env.mongoURL;
const dbName = 'projectdb';

let client;
let categories;
let carts;

const connectCategory = async () => {
  client = await MongoClient.connect(url, { useNewUrlParser: true }, { useUnifiedTopology: true });
  const db = client.db(dbName);
  categories = db.collection('categories');
};

const connectCart = async () => {
  client = await MongoClient.connect(url, { useNewUrlParser: true }, { useUnifiedTopology: true });
  const db = client.db(dbName);
  carts = db.collection('carts');
};

const numericPrice = (price) => {
  const str = price.replace(/[^A-Z0-9]/ig, "");
  const newPrice = Number(str);
  return newPrice;
}

const totalPrice = productArr => {
  let total = 0;
  productArr.forEach(obj => {
    total += obj.price;
  });
  return total;
};

export const getCategories = async () => {
  await connectCategory();
  const allCategories = await categories.find().toArray();
  return allCategories;
};

export const getCart = async (username) => {
  await connectCart();
  const cart = await carts.find({username: username}).toArray();
  return cart;
};

export const postCart = async (username, product) => {
  await connectCart();
  const { id, name, price, img } = product;
  const newPrice = numericPrice(price);
  const item = {
    productId: id,
    name: name,
    price: newPrice,
    img: img
  }
  const cart = {
    username: username,
    products: [item],
    total_items: 1,
    total_price: newPrice,
  }
  await carts.insertOne(cart);
  return cart;
};

export const updateCart = async (username, product) => {
  await connectCart();
  const { id, name, price, img } = product;
  const cart = await carts.find({username: username}).toArray()
  const productsArr = cart[0].products;
  const newPrice = numericPrice(price);
  const item = {
    productId: id,
    name: name,
    price: newPrice,
    img: img
  }

  productsArr.push(item);

  await carts.updateOne(
    { username: username },
    {
      $set: {
        products: productsArr,
        total_items: productsArr.length,
        total_price: totalPrice(productsArr),
      },
    },
  );
}

export const deleteProduct = async (username, product) => {
  await connectCart();
  const cart = await carts.find({username: username}).toArray()
  const productsArr = cart[0].products;
  const updatedProducts = productsArr.filter(item => item.name !== product.name); // refactor with indexOf
  const productsForUpdate = productsArr.filter(item => item.name === product.name);
  productsForUpdate.splice(0, 1);
  productsForUpdate.forEach(obj => {
    updatedProducts.push(obj)
  })

  await carts.updateOne(
    { username: username },
    {
      $set: {
        products: updatedProducts,
        total_items: updatedProducts.length,
        total_price: totalPrice(updatedProducts),
      },
    },
  );
}

export const deleteCart = async (username) => {
  try {
    await connectCart();
    await carts.deleteOne({ username });
    } catch (e) {
    throw new Error(e.message);
  }
};

export default { 
  getCategories,
  getCart,
  postCart,
  updateCart,
  deleteProduct,
  deleteCart
}; 
