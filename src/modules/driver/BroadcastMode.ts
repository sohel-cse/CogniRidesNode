import mongoose, { Model, Schema, Document } from "mongoose";
interface IBroadcast extends Document {

    drivers: any[],
    status: any,
    retryCount: number,
    currentDriver: any,
    startTime: any,
    endTime: any,
    expireAt: any,
    cancelledDrivers: any[]
}

const driverSchema = new mongoose.Schema({
  id: String, // Or mongoose.Schema.Types.ObjectId if you want to use ObjectIds
  fcmToken: String,
  name: String,
});

const BroadcastSchema = new Schema<IBroadcast>(
  {
    drivers: [driverSchema],
    status: {
      type: String,
      enum: ["pending", "accepted", "cancelled"], 
      default: "pending",
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    currentDriver: {
      type: driverSchema,
    },
    startTime: Date,
    endTime: Date,
    expireAt: Date,
    cancelledDrivers: [driverSchema],
  },
  { timestamps: true }
);

export const BroadcastModel: Model<IBroadcast> = mongoose.model<IBroadcast>(
  "Broadcast",
  BroadcastSchema
);
