import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const availabilitySchema = mongoose.Schema(
  {
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
      required: true,
    },
    slots: {
      type: [String],
      default: [],
    },
    timezone: {
      type: String,
      default: "America/Los_Angeles",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

availabilitySchema.index({ dayOfWeek: 1 });

availabilitySchema.plugin(toJSON);

export default mongoose.models.Availability ||
  mongoose.model("Availability", availabilitySchema);
