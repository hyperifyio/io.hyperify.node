

export interface BackendConsoleService {

    destroy () : void;

    stop () : void;

    run () : Promise<void>;

    execute (command: string, args: readonly string[]) : Promise<void>;

}
