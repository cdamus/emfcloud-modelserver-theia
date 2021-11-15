/********************************************************************************
 * Copyright (c) 2020-2021 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 ********************************************************************************/
import {
    MessageMapper,
    MessageType,
    ModelServerClientApiV1,
    ModelServerCommand,
    SubscriptionListener,
    SubscriptionOptions,
    TheiaModelServerClient
} from '@eclipse-emfcloud/modelserver-theia';
import { injectable } from '@theia/core/shared/inversify';

export interface DevModelServerClientApi extends ModelServerClientApiV1 {
    counter(operation: 'add' | 'subtract' | undefined, delta: number | undefined): Promise<object>;
}

export class UpdateTaskNameCommand extends ModelServerCommand {
    constructor(text: string) {
        super('updateTaskName', { text });
    }
}

@injectable()
export class DevModelServerClient extends TheiaModelServerClient implements DevModelServerClientApi {
    private intervalId: NodeJS.Timeout;

    subscribe(modeluri: string, listener: SubscriptionListener, options: SubscriptionOptions = {}): SubscriptionListener {
        if (options.timeout) {
            this.setKeepAliveInterval(modeluri, options.timeout);
        }
        return super.subscribe(modeluri, listener, options);
    }

    private setKeepAliveInterval(modelUri: string, timeout: number): void {
        if (!this.isSocketOpen(modelUri) && modelUri === 'Coffee.ecore') {
            this.intervalId = setInterval(() => this.send(modelUri, { type: MessageType.keepAlive, data: undefined }), timeout > 1000 ? timeout - 1000 : 1);
        }
    }

    unsubscribe(modelUri: string): void {
        const openSocket = this.openSockets.get(modelUri);
        if (openSocket) {
            openSocket.close();
            this.openSockets.delete(modelUri);
        } else {
            console.warn(modelUri + ': Cannot unsubscribe, no socket opened!');
        }
        if (this.intervalId && modelUri === 'Coffee.ecore') {
            clearInterval(this.intervalId);
        }
    }

    async counter(operation?: 'add' | 'subtract', delta?: number): Promise<object> {
        return this.process(this.restClient.get('counter', { params: { operation, delta } }), MessageMapper.asObject);
    }
}
