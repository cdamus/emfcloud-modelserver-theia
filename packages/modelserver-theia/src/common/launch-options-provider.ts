/*********************************************************************************
 * Copyright (c) 2019-2021 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 *********************************************************************************/
export const LaunchOptions = Symbol('LaunchOptions');
export interface LaunchOptions {
    baseURL: string;
    serverPort: number;
    hostname: string;
    jarPath?: string;
    additionalArgs?: string[];
}

export const DEFAULT_LAUNCH_OPTIONS: NonNullable<LaunchOptions> = {
    baseURL: 'api/v1',
    serverPort: 8081,
    hostname: 'localhost'
};

export const LAUNCH_OPTIONS_PROVIDER_SERVICE = '/services/launchOptionsProvider';

export const LaunchOptionsProvider = Symbol('LaunchOptionsProvider');
export interface LaunchOptionsProvider {
    getLaunchOptions(): Promise<LaunchOptions>
}
