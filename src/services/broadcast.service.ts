import { BroadcastRepository } from "../modules/match/BroadcastRepository";
import { RabbitMQService } from "./rabbitmq.service";

export class BroadcastService{
    private rabbitMQService = RabbitMQService.getInstance();
    private repo;
    constructor() {
        this.repo = new BroadcastRepository();
    }

    async accept(id: string) {
        return await this.repo.accept(id);
    }

    async reject(id: string, driverId: string) {
        await this.repo.reject(id, driverId);
    }
}