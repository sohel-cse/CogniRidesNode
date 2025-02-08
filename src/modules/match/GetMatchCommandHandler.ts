import { ICommandHandler } from "../core/ICommandHandler";
import { BroadcastRepository } from "./BroadcastRepository";
import { GetMatchCommand } from "./GetMatchCommand";
import { GetMatchAggregateRoot } from "./MatchAggregateRoot";


export class GetMatchCommandHandler implements ICommandHandler<GetMatchCommand> {
    async handle(command: GetMatchCommand): Promise<void> {
        const repo = new BroadcastRepository();
        const root = new GetMatchAggregateRoot();

        const events: any[] = [];

        const drivers = root.startBroadcast(command.drivers, events);
        repo.create(events[0].payload);
        console.log(' -----------------------------------------------------');
        console.log('GetMatchCommandHandler -> handle -> drivers:', drivers, events);
        console.log(' -----------------------------------------------------');

        // await repo.create({
        //     drivers: [],
        //     currentDriver: 1,
        //     startTime
        // })
        // save broadcast
        // prepare an event array to populate by aggregate root
        // start broadcasting by aggregate root
    }

}