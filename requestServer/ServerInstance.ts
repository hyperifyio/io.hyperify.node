// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

export interface ServerListenCallback {
    () : void
}

export interface ServerCloseCallback {
    () : void
}

export interface ServerInstance {

    listen (port: number, hostname: string | undefined, listenCallback : ServerListenCallback) : void;

    close (closeCallback: ServerCloseCallback) : void;

}
