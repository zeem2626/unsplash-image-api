import express from "express";
import dotenv from "dotenv";

import router from "./routes.js";

dotenv.config({ path: "./.env" });

const app = express();

app.use("/api", router)

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

export default app