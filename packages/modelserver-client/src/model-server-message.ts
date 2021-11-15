/********************************************************************************
 * Copyright (c) 2021 STMicroelectronics and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 ********************************************************************************/
import { isDefinedObject, isObject, isString } from './utils/type-guard-util';

/**
 * A `ModelServermessage` represents the data payload that is sent by the modelserver
 * when responding to incoming requests. It's also used by the client to send messages (e.g. keepAlive messages)
 * to the server.
 * @typeParam D Concrete type of the `data` property. Default is `unknown`.
 */
export interface ModelServerMessage<D = unknown> {
    /** The message data */
    data: D,
    /** The message type. Is a literal of {@link MessageType} unless the modelserver has been extended with custom types */
    type: string
}

export namespace ModelServerMessage {
    /**
     * Guard function to check wether a given object is of type {@link ModelServerMessage}.
     * @param object The object to check.
     * @returns The given object as {@link ModelServerMessage} or `false`.
     */
    export function is(object: unknown): object is ModelServerMessage {
        return isDefinedObject(object) && isString(object, 'type') && isObject(object, 'data');
    }
}

/**
 * Enumeration of the default types of a {@link ModelServerMessage}.
 */
export enum MessageType {
    success = 'success',
    warning = 'warning',
    error = 'error',
    open = 'open',
    close = 'close',
    fullUpdate = 'fullUpdate',
    incrementalUpdate = 'incrementalUpdate',
    dirtyState = 'dirtyState',
    validationResult = 'validationResult',
    keepAlive = 'keepAlive',
    unknown = 'unknown'
}

export namespace MessageType {
    /**
     * Maps the given string to an literal of {@link MessageType}
     * @param value The string to map.
     * @returns the mapped message type literal. If the given string cannot be mapped to an
     *          exact type {@link MessageType.unknown} is returned.
     */
    export function asMessageType(value: string): MessageType {
        if (value in MessageType) {
            return (MessageType as any)[value];
        }
        return MessageType.unknown;
    }
}

/**
 * Representation of an arbitrary model.
 * @typeParam C Concrete type of the `content` property. Default is `unknown`.
 */
export interface Model<C = unknown> {
    /** The uri of the model. */
    modelUri: string;
    /** The model content. */
    content: C;
}

export namespace Model {
    /**
     * Guard function to check wether a given object is of type {@link Model}.
     * @param object The object to check.
     * @returns The given object as {@link Model} or `false`.
     */
    export function is(object: unknown): object is Model {
        return isDefinedObject(object) && isString(object, 'modelUri') && isObject(object, 'content');
    }
}

/**
 * A collection of utility functions to map the `data` property of a {@link ModelServerMessage} to a specific type.
 * If the `data` object of the given message cannot be mapped to the desired type an error is thrown.
 */
export namespace MessageMapper {
    /**
     * Maps the {@link ModelServerMessage.data} property of the given message to string.
     * @param message The message to map.
     * @returns the `data` property as `string`.
     */
    export function asString(message: ModelServerMessage): string {
        if (typeof message.data === 'string') {
            return message.data;
        }
        return JSON.stringify(message.data);
    }

    /**
     * Maps the {@link ModelServerMessage.data} property of the given message to a string[].
     * @param message The message to map.
     * @returns The `data` property as `string[]`.
     * @throws {@link Error} if the 'data' property is not an array.
     */
    export function asStringArray(message: ModelServerMessage): string[] {
        if (Array.isArray(message.data)) {
            return message.data as string[];
        }
        throw new Error('Cannot map "data" property to string[]!');
    }

    /**
     * Maps the {@link ModelServerMessage.data} property of the given message to a boolean.
     * @param message The message to map.
     * @returns The `data` property as boolean or `false` if `data` is not of type `boolean`.
     */
    export function asBoolean(message: ModelServerMessage): boolean {
        return typeof message.data === 'boolean' ? message.data : false;
    }

    /**
     * Maps the {@link ModelServerMessage.data} property of the given message to a {@link Model}[].
     * @param message The message to map.
     * @returns The `data` property as `Model[]`.
     * @throws {@link Error} if the 'data' property is not an array.
     */
    export function asModelArray(message: ModelServerMessage): Model[] {
        if (isDefinedObject(message.data)) {
            return Object.entries(message.data).map(entry => ({ modelUri: entry[0], content: entry[1] } as Model));
        }

        throw new Error('Cannot map "data" property to Model[]!');
    }

    /**
     * Maps the {@link ModelServerMessage.data} property of the given message to an {@link AnyObject}.
     * @param message The message to map.
     * @returns The `data` property as `AnyObject`.
     * @throws {@link Error} if the 'data' property is not of type `object`.
     */
    export function asObject(message: ModelServerMessage): object {
        if (isDefinedObject(message.data)) {
            return message.data;
        }
        throw new Error('Cannot map "data" property to object!');
    }

    /**
     * Maps the {@link ModelServerMessage.data} property of the given message to the desired type if the data object passes the
     * check with the given typeguard successfully.
     * @param message The message to map.
     * @param typeGuard A type guard function to check wether the data object is of the desired type.
     * @param errorMsg Optional custom errorMsg of the error that is thrown if the typeguard check fails.
     * @typeParam T Concrete type to which the message should be mapped.
     * @returns The `data` property as the desired type
     * @throws {@link Error} if the check with the given typeguard fails.
     */
    export function as<T>(message: ModelServerMessage, typeGuard: (object: unknown) => object is T, errorMsg?: string): T {
        if (typeGuard(message.data)) {
            return message.data;
        } else {
            throw new Error(errorMsg ?? 'Cannot map "data" property to the desired type!');
        }
    }

    /**
     * Maps the {@link ModelServerMessage.data} property of the given message to a `boolean` indicating wether the message
     * has the {@link MessageType.success} type.
     * @param message The message to map.
     * @returns `true` if the type of the message is {@link MessageType.success}, `false` otherwise.
     */
    export function isSuccess(message: ModelServerMessage): boolean {
        return message.type === 'success';
    }
}
