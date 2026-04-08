import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const bookingSchema = mongoose.Schema(
  {
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guest",
      required: true,
    },
    guestName: {
      type: String,
      trim: true,
      required: true,
    },
    guestEmail: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    guestTimezone: {
      type: String,
      default: "America/New_York",
    },
    hostTimezone: {
      type: String,
      default: "America/Los_Angeles",
    },
    confirmed: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

bookingSchema.index({ date: 1 });
bookingSchema.index({ guestId: 1 });

bookingSchema.plugin(toJSON);

export default mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema);
