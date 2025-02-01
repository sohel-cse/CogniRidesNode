import { DatabaseService } from "../../services/database.service";
import { IEventHandler } from "../core/IEventHandler";

export class DriverAddedEventHandler implements IEventHandler {
    private dbService: DatabaseService
    constructor(){
        this.dbService = DatabaseService.getInstance();
    }
    
    async handle(payload: any): Promise<void> {
        payload = JSON.parse(payload)
        const db = this.dbService.getDb();
        const collection = db.collection('driver');
        const { userId, status, rating, fcmToken} = payload
        await collection.insertOne({
            userId,
            status,
            rating,
            fcmToken
        })
    }
}