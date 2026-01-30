import express from "express";
import {
  addToCart,
  deleteAll,
  deleteItem,
  getAll,
  getCartCount,
} from "../controllers/cartController.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const cartRouter = express.Router();

cartRouter.post("/add", requireAuth, addToCart);
cartRouter.get("/cart-count", requireAuth, getCartCount);
cartRouter.get("/", requireAuth, getAll);
cartRouter.delete("/:itemId", requireAuth, deleteItem);
cartRouter.delete("/all", requireAuth, deleteAll);
