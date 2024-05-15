import express from "express";
import dotenv from "dotenv";
import requestIp from "request-ip"

import router from "./routes.js";

dotenv.config({ path: "./.env" });

const app = express();

app.set('trust proxy', 1); // Trust one proxy hop
app.use(requestIp.mw());

// app.use(async(req, res, next)=>{
//   const IP1 = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
//       const IP2 = req.clientIp
//       const IP3 = req.ip;
//       console.log("IP 1: ", IP1);
//       console.log("IP 2: ", IP2);
//       console.log("IP 3: ", IP3);
//       console.log(req.socket.remoteAddress);

//       // res.send("Ok")
//       next()
// })

app.use("/api", router)

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

export default app