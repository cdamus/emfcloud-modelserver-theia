/*********************************************************************************
 * Copyright (c) 2021 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 *********************************************************************************/

/**
 * Type that describes a type guard function for a specific type.
 * Takes any object as input and verifies wether the object is of the given concrete type.
 * @typeParam T the concrete type
 */
export type TypeGuard<T> = (object: unknown) => object is T;

/**
 * Typeguard function to check wether a given object is actually defined and and of non-primitive type.
 * @param object The object to check.
 * @returns The object as type `object` or `false` if the guard check fails.
 */
export function isDefinedObject(object: unknown): object is object {
    return object !== undefined && typeof object === 'object';
}

/**
 * Validates whether the given object as a property of type `string` with the given key.
 * @param object The object that should be validated
 * @param propertyKey The key of the property
 * @returns `true` if the object has property with matching key of type `string`.
 */
export function isString(object: any, propertyKey: string): boolean {
    return propertyKey in object && typeof object[propertyKey] === 'string';
}

/**
 * Validates whether the given object as a property of type `boolean` with the given key.
 * @param object The object that should be validated
 * @param propertyKey The key of the property
 * @returns `true` if the object has property with matching key of type `boolean`.
 */
export function isBoolean(object: any, propertyKey: string): boolean {
    return propertyKey in object && typeof object[propertyKey] === 'boolean';
}

/**
 * Validates whether the given object as a property of type `number` with the given key.
 * @param object The object that should be validated
 * @param propertyKey The key of the property
 * @returns `true` if the object has property with matching key of type `number`.
 */
export function isNumber(object: any, propertyKey: string): boolean {
    return propertyKey in object && typeof object[propertyKey] === 'number';
}

/**
 * Validates whether the given object as a property of type `object` with the given key.
 * @param object The object that should be validated
 * @param propertyKey The key of the property
 * @returns `true` if the object has property of type {@link AnyObject}.
 */
export function isObject(object: any, propertyKey: string): boolean {
    return propertyKey in object && isDefinedObject(object[propertyKey]);
}

/**
 * Validates whether the given object as a property of type `Array` with the given key.
 * @param object The object that should be validated
 * @param propertyKey The key of the property
 * @returns `true` if the object has property with matching key of type `Array`.
 */
export function isArray(object: any, propertyKey: string): boolean {
    return propertyKey in object && Array.isArray(object[propertyKey]);
}
