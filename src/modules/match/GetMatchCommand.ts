import { ICommand } from "../core/ICommand";
import { GetMatchCommandDto } from "./GetMatchCommandDto";

export class GetMatchCommand implements ICommand {
    public drivers: GetMatchCommandDto;
    constructor(drivers: GetMatchCommandDto){
        this.drivers = drivers;
    }
}