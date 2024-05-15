import mongoose from "mongoose";

const rateLimiterSchema = new mongoose.Schema(
   {
      rateLimitId: {
         type: String,
         required: true,
         unique: true,
         trim: true,
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
