import express from "express";
import {
  addToCart,
  deleteAll,
  deleteItem,
  getAll,
  getCartCount,
} from "../controllers/cartController.js";

export const cartRouter = express.Router();

cartRouter.post("/add", addToCart);
cartRouter.get("/cart-count", getCartCount);
cartRouter.get("/", getAll);
cartRouter.delete("/:itemId", deleteItem);
cartRouter.delete("/all", deleteAll);
