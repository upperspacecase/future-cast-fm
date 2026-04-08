import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const episodeSchema = mongoose.Schema(
  {
    guestName: {
      type: String,
      trim: true,
      required: true,
    },
    title: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["planned", "scheduled", "recorded", "edited", "published"],
      default: "planned",
    },
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guest",
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    recordingDate: {
      type: Date,
    },
    publishedDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

episodeSchema.index({ status: 1 });

episodeSchema.plugin(toJSON);

export default mongoose.models.Episode ||
  mongoose.model("Episode", episodeSchema);
