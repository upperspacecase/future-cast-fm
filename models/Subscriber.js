import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const subscriberSchema = mongoose.Schema(
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
      unique: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

subscriberSchema.plugin(toJSON);

export default mongoose.models.Subscriber ||
  mongoose.model("Subscriber", subscriberSchema);
