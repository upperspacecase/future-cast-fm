import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const clipSchema = mongoose.Schema(
  {
    episodeNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    filename: {
      type: String,
      required: true,
    },
    r2Key: {
      type: String,
      required: true,
      unique: true,
    },
    publicUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "queued", "posted", "failed"],
      default: "pending",
      index: true,
    },
    bufferPostId: {
      type: String,
    },
    scheduledAt: {
      type: Date,
    },
    postedAt: {
      type: Date,
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

clipSchema.index({ status: 1, createdAt: 1 });

clipSchema.plugin(toJSON);

export default mongoose.models.Clip || mongoose.model("Clip", clipSchema);
