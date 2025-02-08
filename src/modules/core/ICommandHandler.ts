export interface ICommandHandler<ICommand> {
    handle(command: ICommand): Promise<void>;
}