import { Router } from "express";


import { signin, verifyLogin,searchImage } from "./controller.js";
import {rateLimiter} from "./middleware.js"

const router = Router()

// Authenticated Routes
router.get("/signin/:username/:fullname/:password", signin)
router.get("/login/:username/:password", verifyLogin, (req, res)=>{
  res.status(200).json({message: "Verified", data: req.user})
})


// Rate Limited Routes
// router.get("/login/:username/:password/photos/:q", verifyLogin, searchImage)
router.get("/login/:username/:password/photos/:q", verifyLogin, rateLimiter, searchImage)

router.get("/photos/:q", rateLimiter, searchImage)



export default router