/*********************************************************************************
 * Copyright (c) 2021 STMicroelectronics and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 *********************************************************************************/
import { Model, ModelServerMessage } from './model-server-message';
import { ModelServerCommand } from './model/command-model';
import { Diagnostic } from './model/diagnostic';
import { SubscriptionListener } from './subscription-listener';
import { TypeGuard } from './utils/type-guard-util';

export interface SubscriptionOptions {
    format?: string;
    timeout?: number;
    livevalidation?: boolean;
    errorWhenUnsuccessful?: boolean;
}

export interface ServerConfiguration {
    workspaceRoot: string;
    uiSchemaFolder?: string;
}

export interface ModelServerClientApiV1 {
    get(modeluri: string, format?: string): Promise<object>;
    get<M>(modeluri: string, typeGuard: TypeGuard<M>, format?: string): Promise<M>;

    getAll(format?: string): Promise<Model[]>;
    getAll<M>(typeGuard: TypeGuard<M>, format?: string): Promise<Model<M>[]>;

    getModelUris(): Promise<string[]>;

    getElementById(modeluri: string, elementid: string, format?: string): Promise<object>;
    getElementById<M>(modeluri: string, elementid: string, typeGuard: TypeGuard<M>, format?: string): Promise<M>;

    getElementByName(modeluri: string, elementname: string, format?: string): Promise<object>;
    getElementByName<M>(modeluri: string, elementname: string, typeGuard: TypeGuard<M>, format?: string): Promise<M>;

    delete(modeluri: string): Promise<boolean>;

    close(modeluri: string): Promise<boolean>;

    create(modeluri: string, model: object | string, format?: string): Promise<object>;
    create<M>(modeluri: string, model: object | string, typeGuard: TypeGuard<M>, format?: string): Promise<M>;

    update(modeluri: string, model: object | string, format?: string): Promise<object>
    update<M>(modeluri: string, model: object | string, typeGuard: TypeGuard<M>, format?: string): Promise<M>;

    save(modeluri: string): Promise<boolean>;

    saveAll(): Promise<boolean>;

    validate(modeluri: string): Promise<Diagnostic>;

    getValidationConstraints(modeluri: string): Promise<string>;

    getTypeSchema(modeluri: string): Promise<string>;

    getUiSchema(schemaname: string): Promise<string>;

    configureServer(configuration: ServerConfiguration): Promise<boolean>;

    ping(): Promise<boolean>;

    edit(modeluri: string, command: ModelServerCommand, format?: string): Promise<boolean>;

    undo(modeluri: string): Promise<string>;

    redo(modeluri: string): Promise<string>;

    // WebSocket connection
    subscribe(modeluri: string, listener: SubscriptionListener, options?: SubscriptionOptions): SubscriptionListener;

    send(modelUri: string, message: ModelServerMessage): void;
    unsubscribe(modelUri: string): void;
}

export namespace ModelServerClientApiV1 {
    export const API_ENDPOINT = '/api/v1';
}
