// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { DefaultValueCallbackFactory } from "../../../core/cmd/types/DefaultValueCallbackFactory";
import { DefaultValueCallbackUtils } from "../../../core/cmd/utils/DefaultValueCallbackUtils";
import { NodeDefaultValueCallbackUtils } from "./NodeDefaultValueCallbackUtils";
import { DefaultValueCallback } from "../../../core/cmd/types/DefaultValueCallback";

export class NodeDefaultValueFactoryImpl implements DefaultValueCallbackFactory {

    protected constructor () {
    }

    public static create () : DefaultValueCallbackFactory {
        return new NodeDefaultValueFactoryImpl();
    }

    public fromAutowired (name: string): DefaultValueCallback {
        return DefaultValueCallbackUtils.fromAutowired(name);
    }

    public fromChain (...callbacks: DefaultValueCallback[]): DefaultValueCallback {
        return DefaultValueCallbackUtils.fromChain(...callbacks);
    }

    public fromTextFile (): DefaultValueCallback {
        return NodeDefaultValueCallbackUtils.readFromFile('utf8');
    }

}
