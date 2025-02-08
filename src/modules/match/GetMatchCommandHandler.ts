import { ICommandHandler } from "../core/ICommandHandler";
import { GetMatchCommand } from "./GetMatchCommand";


export class GetMatchCommandHandler implements ICommandHandler<GetMatchCommand> {
    async handle(command: GetMatchCommand): Promise<void> {
        
    }

}