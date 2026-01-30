import { getDBConnection } from "../db/db.js";

export async function addToCart(req, res) {
  const db = await getDBConnection();

  /*
Challenge:

1. Write code to ensure that when a logged-in user clicks 'Add to Cart', the product is either added to their cart or its quantity increased if it’s already there, storing the data in the cart_items table. If successful, send the frontend this JSON: { message: 'Added to cart' }.

Ignore frontend console errors for now!

For testing, log in with:
Username: test
Password: test

Use logTable.js to verify success!

Loads of help in hint.md
*/
  const productId = parseInt(req.body.productId, 10);

  if (isNaN(productId)) {
    return res.status(400).json({ error: "Invalid product ID" });
  }

  const userId = req.session.userId;

  const existing = await db.get(
    "SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?",
    [userId, productId],
  );

  if (existing) {
    await db.run("UPDATE cart_items SET quantity = quantity + 1 WHERE id = ?", [
      existing.id,
    ]);
  } else {
    await db.run(
      "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, 1)",
      [userId, productId],
    );
  }

  res.json({ message: "Added to cart" });
}

export async function getCartCount(req, res) {
  const db = await getDBConnection();

  /*
Challenge:

1. Write code to ensure that when a logged-in user clicks 'Add to Cart', their current cart count is shown in the header with a cart icon. The frontend has been done for you. All the backend need do is provide the following JSON on the /api/cart/cart-count endpoint:
{ <THE TOTAL NUMBER OF THE USER'S ITEMS> || 0 }

Ignore frontend console errors for now!

For testing, log in with:
Username: test
Password: test

Loads of help in hint.md
*/

  const result = await db.get(
    `SELECT SUM(quantity) AS totalItems FROM cart_items WHERE user_id = ?`,
    [req.session.userId],
  );

  res.json({ totalItems: result.totalItems || 0 });
}

export async function getAll(req, res) {
  const db = await getDBConnection();

  /*
Challenge:

1. When a logged-in user clicks the cart icon, they will be redirected to the cart.html page. To render the user's cart, the frontend needs to get an array of objects similar to the example below when it makes a GET request to the /api/cart endpoint. Important: this array should be sent in a JSON object with the key 'items'.

[
  {
    cartItemId: 4,
    quantity: 2,
    title: 'Selling Dogma',
    artist: 'The Clouds',
    price: 44.99
  },
  {
    cartItemId: 5,
    quantity: 1,
    title: 'Midnight Parallels',
    artist: 'Neon Grove',
    price: 40.99
  }
]

The frontend JS has been done for you.

Ignore frontend console errors for now!

For testing, log in with:
Username: test
Password: test

Then click the cart icon to go to the cart page. You should see the user’s items.

Loads of help in hint.md
*/
  const productsByUser = await db.all(
    `SELECT c.id as cartItemId, c.quantity, p.title, p.artist, p.price FROM cart_items c INNER JOIN products p ON c.product_id = p.id WHERE c.user_id = ?`,
    [req.session.userId],
  );

  return res.json({ items: productsByUser });
}

export async function deleteItem(req, res) {
  const db = await getDBConnection();
  /*
Challenge:
1. When a user clicks the delete button, that item should be deleted from the cart_items table, regardless of quantity.

2. Research Challenge: You need to think about how to end the response! What status code should you use, and what method? (Clue: it’s not the json() method!)

hint.md for help!
*/
  const itemId = parseInt(req.params.itemId, 10);
  if (isNaN(itemId)) {
    return res.status(400).json({ error: "Invalid item ID" });
  }

  const item = await db.get(
    "SELECT quantity FROM cart_items WHERE id = ? AND user_id = ?",
    [itemId, req.session.userId],
  );

  if (!item) {
    return res.status(400).json({ error: "Item not found" });
  }

  await db.run("DELETE FROM cart_items WHERE id = ? AND user_id = ?", [
    itemId,
    req.session.userId,
  ]);

  res.status(204).send();
}

export async function deleteAll(req, res) {
  const db = await getDBConnection();

  /*
Challenge:
1. Delete all cart items for a user.
*/
  await db.run(`DELETE FROM cart_items WHERE user_id = ?`, [
    req.session.userId,
  ]);
  res.status(204).send();
}
