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
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import WebSocket from 'isomorphic-ws';

import { ModelServerClientApiV1, ServerConfiguration, SubscriptionOptions } from './model-server-client-api-v1';
import { MessageMapper, Model, ModelServerMessage } from './model-server-message';
import { ModelServerPaths } from './model-server-paths';
import { ModelServerCommand } from './model/command-model';
import { Diagnostic } from './model/diagnostic';
import { SubscriptionListener } from './subscription-listener';
import { TypeGuard } from './utils/type-guard-util';

/**
 * Helper type for method overloads where on parameter could either be
 * a 'format' string or a typeguard to cast the response to a concrete type.
 */
type FormatOrGuard<M> = string | TypeGuard<M>;
/**
 * A client to interact with a model server.
 */
export class ModelServerClient implements ModelServerClientApiV1 {

    protected restClient: AxiosInstance;
    protected openSockets: Map<string, WebSocket> = new Map();
    protected _baseUrl: string;
    protected defaultFormat: string;

    initialize(baseUrl: string, defaultFormat?: string): void | Promise<void> {
        this._baseUrl = baseUrl;
        this.restClient = axios.create(this.getAxisConfig(baseUrl));
        this.defaultFormat = defaultFormat ?? 'json';
    }

    protected getAxisConfig(baseURL: string): AxiosRequestConfig | undefined {
        return { baseURL };
    }

    get(modeluri: string, format?: string): Promise<object>;
    get<M>(modeluri: string, typeGuard: TypeGuard<M>, format?: string): Promise<M>;
    get<M>(modeluri: string, formatOrGuard?: FormatOrGuard<M>, format?: string): Promise<object | M> {
        if (typeof formatOrGuard === 'function') {
            const typeGuard = formatOrGuard;
            return this.process(this.restClient.get(ModelServerPaths.MODEL_CRUD, { params: { modeluri, format } }), msg => MessageMapper.as(msg, typeGuard));
        }
        format = formatOrGuard;
        return this.process(this.restClient.get(ModelServerPaths.MODEL_CRUD, { params: { modeluri, format } }), MessageMapper.asObject);
    }

    getAll(format?: string): Promise<Model<unknown>[]>;
    getAll<M>(typeGuard: TypeGuard<M>, format?: string): Promise<Model<M>[]>;
    getAll<M>(formatOrGuard?: FormatOrGuard<M>, format?: string): Promise<Model[] | Model<M>[]> {
        if (typeof formatOrGuard === 'function') {
            const typeGuard = formatOrGuard;
            const mapper: (response: ModelServerMessage) => Model[] = msg => MessageMapper.asModelArray(msg).map(model => {
                if (typeGuard(model)) {
                    return model;
                }
                throw Error('Could not map content of model. Typeguard check failed');
            });
            return this.process(this.restClient.get(ModelServerPaths.MODEL_CRUD, { params: { format } }), mapper);
        }
        format = formatOrGuard;
        return this.process(this.restClient.get(ModelServerPaths.MODEL_CRUD, { params: { format } }), MessageMapper.asModelArray);
    }

    getModelUris(): Promise<string[]> {
        return this.process(this.restClient.get(ModelServerPaths.MODEL_URIS), MessageMapper.asStringArray);
    }

    getElementById(modeluri: string, elementid: string, format?: string): Promise<object>;
    getElementById<M>(modeluri: string, elementid: string, typeGuard: TypeGuard<M>): Promise<M>;
    getElementById<M>(modeluri: string, elementid: string, formatOrGuard?: FormatOrGuard<M>, format?: string): Promise<object | M> {
        if (typeof formatOrGuard === 'function') {
            const typeGuard = formatOrGuard;
            return this.process(this.restClient.get(ModelServerPaths.MODEL_ELEMENT, { params: { modeluri, elementid, format } }), msg => MessageMapper.as(msg, typeGuard));
        }
        format = formatOrGuard;
        return this.process(this.restClient.get(ModelServerPaths.MODEL_ELEMENT, { params: { modeluri, elementid, format } }), MessageMapper.asObject);
    }

    getElementByName(modeluri: string, elementname: string, format?: string): Promise<object>;
    getElementByName<M>(modeluri: string, elementname: string, typeGuard: TypeGuard<M>, format?: string): Promise<M>;
    getElementByName<M>(modeluri: string, elementname: string, formatOrGuard?: FormatOrGuard<M>, format?: string): Promise<object | M> {
        if (typeof formatOrGuard === 'function') {
            const typeGuard = formatOrGuard;
            return this.process(this.restClient.get(ModelServerPaths.MODEL_ELEMENT, { params: { modeluri, elementname, format } }), msg => MessageMapper.as(msg, typeGuard));
        }
        format = formatOrGuard;
        return this.process(this.restClient.get(ModelServerPaths.MODEL_ELEMENT, { params: { modeluri, elementname, format } }), MessageMapper.asObject);
    }

    create(modeluri: string, model: object | string, format?: string): Promise<object>;
    create<M>(modeluri: string, model: object | string, typeGuard: TypeGuard<M>, format?: string): Promise<M>;
    create<M>(modeluri: string, model: object | string, formatOrGuard?: FormatOrGuard<M>, format?: string): Promise<object | M> {
        if (typeof formatOrGuard === 'function') {
            const typeGuard = formatOrGuard;
            return this.process(this.restClient.post(ModelServerPaths.MODEL_CRUD, { data: model }, { params: { modeluri, format } }), msg => MessageMapper.as(msg, typeGuard));
        }
        format = formatOrGuard;
        return this.process(this.restClient.post(ModelServerPaths.MODEL_CRUD, { data: model }, { params: { modeluri, format } }), MessageMapper.asObject);
    }

    update(modeluri: string, model: object | string, format?: string): Promise<object>;
    update<M>(modeluri: string, model: string | string, typeGuard: TypeGuard<M>, format?: string): Promise<M>;
    update<M>(modeluri: string, model: object | string, formatOrGuard?: FormatOrGuard<M>, format?: string): Promise<object> | Promise<M> {
        if (typeof formatOrGuard === 'function') {
            const typeGuard = formatOrGuard;
            return this.process(this.restClient.patch(ModelServerPaths.MODEL_CRUD, { data: model }, { params: { modeluri, format } }), msg => MessageMapper.as(msg, typeGuard));
        }
        format = formatOrGuard;
        return this.process(this.restClient.patch(ModelServerPaths.MODEL_CRUD, { data: model }, { params: { modeluri, format } }), MessageMapper.asObject);

    }

    delete(modeluri: string): Promise<boolean> {
        return this.process(this.restClient.delete(ModelServerPaths.MODEL_CRUD, { params: { modeluri } }), MessageMapper.isSuccess);
    }

    close(modeluri: string): Promise<boolean> {
        return this.process(this.restClient.post(ModelServerPaths.CLOSE, undefined, { params: { modeluri } }), MessageMapper.isSuccess);
    }

    save(modeluri: string): Promise<boolean> {
        return this.process(this.restClient.get(ModelServerPaths.SAVE, { params: { modeluri } }), MessageMapper.isSuccess);
    }

    saveAll(): Promise<boolean> {
        return this.process(this.restClient.get(ModelServerPaths.SAVE_ALL), MessageMapper.isSuccess);
    }

    validate(modeluri: string): Promise<Diagnostic> {
        return this.process(this.restClient.get(ModelServerPaths.VALIDATION, { params: { modeluri } }), response => MessageMapper.as(response, Diagnostic.is));
    }

    getValidationConstraints(modeluri: string): Promise<string> {
        return this.process(this.restClient.get(ModelServerPaths.VALIDATION_CONSTRAINTS, { params: { modeluri } }), MessageMapper.asString);
    }

    getTypeSchema(modeluri: string): Promise<string> {
        return this.process(this.restClient.get(ModelServerPaths.TYPE_SCHEMA, { params: { modeluri } }), MessageMapper.asString);
    }

    getUiSchema(schemaname: string): Promise<string> {
        return this.process(this.restClient.get(ModelServerPaths.UI_SCHEMA, { params: { schemaname } }), MessageMapper.asString);
    }

    configureServer(configuration: ServerConfiguration): Promise<boolean> {
        let { workspaceRoot, uiSchemaFolder } = configuration;
        workspaceRoot = workspaceRoot.replace('file://', '');
        uiSchemaFolder = uiSchemaFolder?.replace('file://', '');
        return this.process(this.restClient.put(ModelServerPaths.SERVER_CONFIGURE, { workspaceRoot, uiSchemaFolder }), MessageMapper.isSuccess);
    }

    ping(): Promise<boolean> {
        return this.process(this.restClient.get(ModelServerPaths.SERVER_PING), MessageMapper.isSuccess);
    }

    edit(modeluri: string, command: ModelServerCommand, format = this.defaultFormat): Promise<boolean> {
        return this.process(
            this.restClient.patch(ModelServerPaths.EDIT, { data: command }, { params: { modeluri, format } }),
            MessageMapper.isSuccess
        );
    }

    undo(modeluri: string): Promise<string> {
        return this.process(this.restClient.get(ModelServerPaths.UNDO, { params: { modeluri } }), MessageMapper.asString);
    }

    redo(modeluri: string): Promise<string> {
        return this.process(this.restClient.get(ModelServerPaths.REDO, { params: { modeluri } }), MessageMapper.asString);
    }

    send(modelUri: string, message: ModelServerMessage): void {
        const openSocket = this.openSockets.get(modelUri);
        if (openSocket) {
            openSocket.send(message);
        }
    }

    subscribe(modeluri: string, listener: SubscriptionListener, options: SubscriptionOptions = {}): SubscriptionListener {
        if (this.isSocketOpen(modeluri)) {
            const errorMsg = `${modeluri} : Cannot open new socket, already subscribed!'`;
            console.warn(errorMsg);
            if (options.errorWhenUnsuccessful) {
                throw new Error('errorMsg');
            }
        }
        const path = this.createSubscriptionPath(modeluri, options);
        this.doSubscribe(listener, modeluri, path);
        return listener;
    }

    unsubscribe(modeluri: string): void {
        const openSocket = this.openSockets.get(modeluri);
        if (openSocket) {
            openSocket.close();
            this.openSockets.delete(modeluri);
        }
    }

    protected createSubscriptionPath(modeluri: string, options: SubscriptionOptions): string {
        const queryParams = new URLSearchParams();
        queryParams.append('modeluri', modeluri);
        if (!options.format) {
            options.format = this.defaultFormat;
        }
        Object.entries(options).forEach(entry => queryParams.append(entry[0], entry[1]));
        queryParams.delete('errorWhenUnsuccessful');
        return `${this._baseUrl}${ModelServerPaths.SUBSCRIPTION}?${queryParams.toString()}`.replace(/^(http|https):\/\//i, 'ws://');
    }

    protected doSubscribe(listener: SubscriptionListener, modelUri: string, path: string): void {
        const socket = new WebSocket(path.trim());
        socket.onopen = event => listener.onOpen?.(modelUri, event);
        socket.onclose = event => listener.onClose?.(modelUri, event);
        socket.onerror = event => listener.onError?.(modelUri, event);
        socket.onmessage = event => listener.onMessage?.(modelUri, event);
        this.openSockets.set(modelUri, socket);
    }

    protected isSocketOpen(modelUri: string): boolean {
        return this.openSockets.get(modelUri) !== undefined;
    }

    protected async process<T>(request: Promise<AxiosResponse<ModelServerMessage>>, wrapper: (response: ModelServerMessage) => T): Promise<T> {
        try {
            const response = await request;
            if (response.data.type === 'error') {
                throw new ModelServerError(response.data);
            }
            return wrapper(response.data);
        } catch (error) {
            if (isAxiosError(error)) {
                const message = error.response?.data ? error.response.data : error.message;
                throw new ModelServerError(message, error.code);
            } else {
                throw error;
            }
        }
    }
}

export class ModelServerError extends Error {
    readonly code?: string;
    constructor(response: ModelServerMessage | string, code?: string) {
        super(typeof response === 'string' ? response : MessageMapper.asString(response));
        this.code = code;
    }
}

function isAxiosError(error: any): error is AxiosError {
    return error !== undefined && error instanceof Error && 'isAxiosError' in error && error['isAxiosError'];
}
