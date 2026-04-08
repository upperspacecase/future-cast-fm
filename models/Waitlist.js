import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const waitlistSchema = mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
    },
    source: {
      type: String,
      default: "i-want-this",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

waitlistSchema.index({ email: 1 }, { unique: true });

waitlistSchema.plugin(toJSON);

export default mongoose.models.Waitlist ||
  mongoose.model("Waitlist", waitlistSchema);
