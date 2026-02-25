import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);