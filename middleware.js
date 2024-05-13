import { RateLimiter } from "./model.rateLimiter.js";
import ip from "ip";

const accessGrant = async (rateLimiterId, rateLimit) => {
   try {
      // Find User Rate Limit Data
      const rateLimitUserData = await RateLimiter.findOne({
         rateLimiterId,
      });
      //  Rate Limit Data not available
      if (!rateLimitUserData) {
         const newUser = await RateLimiter.create({
            rateLimiterId,
            tokens: rateLimit.maxRequest,
         });
         return true;
      }

      //  Rate Limit Data available
      const timeDifference = (Date.now() - rateLimitUserData.lastFilled) / 1000;

      //  New Session Fill Maximum Tokens
      if (timeDifference > rateLimit.timeInterval) {
         rateLimitUserData.tokens = rateLimit.maxRequest - 1;

         rateLimitUserData.lastFilled = Date.now();
         await rateLimitUserData.save();
         return true;
      }
      //  Old Session But Tokens Available
      else if (rateLimitUserData.tokens > 0) {
         rateLimitUserData.tokens -= 1;

         rateLimitUserData.lastFilled = Date.now();
         await rateLimitUserData.save();
         return true;
      }
      // Niether New Session Nor Enough Tokens
      //  Access Denied
      return false;
   } catch (error) {
      throw new Error("Something went wrong");
   }
};

const rateLimitUser = {
   maxRequest: 3,
   timeInterval: 60,
};

const rateLimitDevice = {
   maxRequest: 5,
   timeInterval: 60,
};

const rateLimiter = async (req, res, next) => {
   try {
      const username = req.user?.username;
      const ipAddress = ip.address();

      let userAccess, deviceAccess;
      // If User Not Loged In
      if (!username) {
         userAccess = true;
      }
      // User Loged In
      else {
         userAccess = await accessGrant(username, rateLimitUser);
      }

      deviceAccess = await accessGrant(ipAddress, rateLimitDevice);

      // Both User And Device Should Have Access (Token)
      if (userAccess && deviceAccess) {
         next();
      } else {
         // Problem Fix
         let userLimitData, deviceLimitData;
         if (userAccess) {
            userLimitData = await RateLimiter.findOneAndUpdate(
               { username },
               { $inc: { tokens: 1 } },
               { new: true }
            );
         }
         if (deviceAccess) {
            deviceLimitData = await RateLimiter.findOneAndUpdate(
               { ipAddress },
               { $inc: { tokens: 1 } },
               { new: true }
            );
         }

         res.status(429).json({
            message: "Too many request",
         });
      }
   } catch (error) {
      res.status(400).json({ message: error.message });

      next(error);
   }
};

export { rateLimiter };
