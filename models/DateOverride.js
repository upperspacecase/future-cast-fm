import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const dateOverrideSchema = mongoose.Schema(
  {
    // The specific calendar date as YYYY-MM-DD string
    date: {
      type: String,
      required: true,
    },
    // The time slot removed, e.g. "10:00"
    slotTime: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

dateOverrideSchema.index({ date: 1, slotTime: 1 }, { unique: true });

dateOverrideSchema.plugin(toJSON);

export default mongoose.models.DateOverride ||
  mongoose.model("DateOverride", dateOverrideSchema);
