import { RateLimiter } from "./model.rateLimiter.js";

const accessGrant = async (rateLimitId, rateLimit) => {
   try {
      // Find User Rate Limit Data
      const rateLimitData = await RateLimiter.findOne({
         rateLimitId,
      });
      //  Rate Limit Data not available
      if (!rateLimitData) {
         const newUser = await RateLimiter.create({
            rateLimitId,
            tokens: rateLimit.maxRequest - 1,
         });
         return { access: true, rateLimitData: newUser };
      }

      //  Rate Limit Data available
      const timeDifference = (Date.now() - rateLimitData.lastFilled) / 1000;

      //  New Session Fill Maximum Tokens
      if (timeDifference > rateLimit.timeInterval) {
         rateLimitData.tokens = rateLimit.maxRequest - 1;
         rateLimitData.lastFilled = Date.now();

         return { access: true, rateLimitData };
      }
      //  Old Session But Tokens Available
      else if (rateLimitData.tokens > 0) {
         rateLimitData.tokens -= 1;
         rateLimitData.lastFilled = Date.now();

         return { access: true, rateLimitData };
      }
      // Niether New Session Nor Enough Tokens
      //  Access Denied
      return { access: false, rateLimitData };
   } catch (error) {
      throw new Error(error);
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
      const ipAddress =
         req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      const ip = ipAddress.split(",")[0];

      // const IP = req.clientIp;
      console.log("IP :", ip);

      let userAccess = { access: "pass" },
         deviceAccess;
      // If User Not Loged In
      if (username) {
         userAccess = await accessGrant(username, rateLimitUser);
      }

      deviceAccess = await accessGrant(ip, rateLimitDevice);

      // Both User And Device Should Have Access (Token)
      // Proceed Request
      if (userAccess.access && deviceAccess.access) {
         if (userAccess.access != "pass") {
            await userAccess.rateLimitData.save();
         }

         await deviceAccess.rateLimitData.save();
         next();
      }
      // Reject Request
      else {
         let userTimeLeft = Math.ceil(
            rateLimitUser.timeInterval -
               (Date.now() - userAccess?.rateLimitData?.lastFilled) / 1000
         );

         userTimeLeft = !userTimeLeft || userTimeLeft >= 60 ? 0 : userTimeLeft;

         let deviceTimeLeft = Math.ceil(
            rateLimitDevice.timeInterval -
               (Date.now() - deviceAccess.rateLimitData?.lastFilled) / 1000
         );

         deviceTimeLeft = deviceTimeLeft >= 60 ? 0 : deviceTimeLeft;
         res.status(429).json({
            message: "Too many request",
            waitingTime: {
               user: `${userTimeLeft} s`,
               device: `${deviceTimeLeft} s`,
            },
         });
      }
   } catch (error) {
      res.status(400).json({ message: error.message });

      next(error);
   }
};

export { rateLimiter };
