import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const guestSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
    },
    podcastName: {
      type: String,
      trim: true,
      required: true,
    },
    podcastDescription: {
      type: String,
      trim: true,
    },
    podcastUrl: {
      type: String,
      trim: true,
    },
    feedUrl: {
      type: String,
      trim: true,
    },
    artworkUrl: {
      type: String,
      trim: true,
    },
    genres: {
      type: [String],
      default: [],
    },
    aiScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    aiReason: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "discovered",
        "emailed",
        "opened",
        "clicked",
        "accepted",
        "scheduled",
        "recorded",
        "rejected",
      ],
      default: "discovered",
    },
    resendMessageId: {
      type: String,
    },
    emailSentAt: {
      type: Date,
    },
    emailOpenedAt: {
      type: Date,
    },
    emailClickedAt: {
      type: Date,
    },
    acceptedAt: {
      type: Date,
    },
    scheduledAt: {
      type: Date,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

guestSchema.index({ email: 1 }, { unique: true });
guestSchema.index({ status: 1 });
guestSchema.index({ aiScore: -1 });

guestSchema.plugin(toJSON);

export default mongoose.models.Guest || mongoose.model("Guest", guestSchema);
