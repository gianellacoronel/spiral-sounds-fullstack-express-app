import express from "express";
import { productsRouter } from "./routes/products.js";
import { authRouter } from "./routes/auth.js";
import session from "express-session";
import { meRouter } from "./routes/me.js";
import { cartRouter } from "./routes/cart.js";

const app = express();
const PORT = 8000;
const secret = process.env.SPIRAL_SESSION_SECRET || "jellyfish-baskingshark";
/*
Challenge:

1. What middleware do we need to make this work?

*/
//Without this middleware, we will have req.body = undefined
// This use the upcoming json and passes it to thereq.body
app.use(express.json());

app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: false, // Prevents empty session from being stored
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    },
  }),
);

app.use(express.static("public"));

app.use("/api/products", productsRouter);

app.use("/api/auth/me", meRouter);
app.use("/api/auth", authRouter);
app.use("/api/cart", cartRouter);

app
  .listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  })
  .on("error", (err) => {
    console.error("Failed to start server:", err);
  });
