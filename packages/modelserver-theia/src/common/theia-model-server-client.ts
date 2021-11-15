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
import { ModelServerClient } from '@eclipse-emfcloud/modelserver-client';
import { decorate, inject, injectable } from '@theia/core/shared/inversify';

import { LaunchOptions, LaunchOptionsProvider } from './launch-options-provider';

decorate(injectable(), ModelServerClient);

@injectable()
export class TheiaModelServerClient extends ModelServerClient {
    protected launchOptions: LaunchOptions;

    constructor(@inject(LaunchOptionsProvider) launchOptionsProvider: LaunchOptionsProvider) {
        super();
        launchOptionsProvider.getLaunchOptions().then(options => {
            this.launchOptions = options;
            this.initialize(this.getBaseUrl());
        });

    }

    protected getBaseUrl(): string {
        const baseUrl = `http://${this.launchOptions.hostname}:${this.launchOptions.serverPort}/${this.launchOptions.baseURL}`;
        return baseUrl;

    }
}
