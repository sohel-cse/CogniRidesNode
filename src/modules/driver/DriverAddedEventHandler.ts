import { DatabaseService } from "../../services/database.service";
import { IEventHandler } from "../core/IEventHandler";
import { DriverModel } from "./DriverModel";

export class DriverAddedEventHandler implements IEventHandler {
    private dbService: DatabaseService;

    constructor() {
        this.dbService = DatabaseService.getInstance();
    }

    async handle(payload: any): Promise<void> {
        try {
            const parsedPayload = JSON.parse(payload);

            // Validate required fields
            if (!parsedPayload.email || !parsedPayload.identificationNumber) {
                console.error("Missing required fields:", parsedPayload);
                return;
            }

        
            const existingDriver = await DriverModel.findOne({ email: parsedPayload.email });

            if (existingDriver) {
                console.warn(`Driver with email ${parsedPayload.email} already exists.`);
                return;
            }

            // Create a new driver document
            const newDriver = new DriverModel(parsedPayload);
            await newDriver.save();

            console.log(`Driver with email ${parsedPayload.email} added successfully.`);
        } catch (error) {
            console.error("Error handling DriverAdded event:", error);
        }
    }
}
