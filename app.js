import express from "express";
import dotenv from "dotenv";
import requestIp from "request-ip"

import router from "./routes.js";

dotenv.config({ path: "./.env" });

const app = express();

app.set('trust proxy', 1); // Trust one proxy hop
app.use(requestIp.mw());

app.use("/api", router)

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

export default app