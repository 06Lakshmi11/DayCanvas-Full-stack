const mongoose = require("mongoose");

const checklistItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    done: { type: Boolean, default: false },
  },
  { _id: false }
);

const noteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    dateKey: { type: String, required: true, index: true }, // "YYYY-MM-DD"
    type: { type: String, enum: ["text", "checklist"], default: "text" },
    text: { type: String, default: "" },
    items: { type: [checklistItemSchema], default: [] },
    color: { type: String, default: "#6e8b6e" },
    bold: { type: Boolean, default: false },
    italic: { type: Boolean, default: false },
    fontSize: { type: String, enum: ["small", "medium", "large"], default: "medium" },
    priority: { type: String, enum: ["none", "low", "medium", "high"], default: "none" },
    image: { type: String, default: null }, // base64 data URL, resized client-side
    reminderTime: { type: String, default: null }, // "HH:MM"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);
