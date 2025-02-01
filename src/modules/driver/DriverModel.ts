import mongoose, { Model, Schema, Document } from 'mongoose';
interface IDriver extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    identificationNumber: string;
    identificationType: string;
    identificationDocuments: string[];
    presentAddress: string;
    permanentAddress: string;
    trainingStatus: string;
    licenseType: string;
    vehicleType: string;
    vehicleFitnessStatus: string;
    status: string;
    rating: number;
    activeStatus: boolean;
    licenseDocuments: string[];
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

const DriverSchema = new Schema<IDriver>(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String, required: true },
        identificationNumber: { type: String, required: true, unique: true },
        identificationType: { type: String, required: true },
        identificationDocuments: { type: [String], required: true },
        presentAddress: { type: String, required: true },
        permanentAddress: { type: String, required: true },
        trainingStatus: { type: String, required: true },
        licenseType: { type: String, required: true },
        vehicleType: { type: String, required: true },
        vehicleFitnessStatus: { type: String, required: true },
        status: { type: String, required: true, enum: ["Active", "Inactive"] },
        rating: { type: Number, required: true, min: 0, max: 5 },
        activeStatus: { type: Boolean, required: true },
        licenseDocuments: { type: [String], required: true },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

export const DriverModel: Model<IDriver> = mongoose.model<IDriver>("Driver", DriverSchema);
