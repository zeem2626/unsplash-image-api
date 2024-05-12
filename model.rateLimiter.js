import mongoose from "mongoose";

const rateLimiterSchema = new mongoose.Schema(
   {
      rateLimiterId: {
         type: String,
         required: true,
         unique: true,
         trim: true,
         lowercase: true,
        },
        tokens: {
          type: Number,
          required: true,
      },
      lastFilled: {
         type: Number,
         default: Date.now(),
      },
   }
);

const RateLimiter = mongoose.model("RateLimiter", rateLimiterSchema);

export { RateLimiter };
