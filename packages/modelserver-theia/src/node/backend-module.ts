/********************************************************************************
 * Copyright (c) 2019-2021 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 ********************************************************************************/
import { ConnectionHandler, JsonRpcConnectionHandler } from '@theia/core';
import { BackendApplicationContribution } from '@theia/core/lib/node';
import { ContainerModule } from '@theia/core/shared/inversify';

import { LAUNCH_OPTIONS_PROVIDER_SERVICE, LaunchOptionsProvider } from '../common/launch-options-provider';
import { TheiaModelServerClient } from '../common/theia-model-server-client';
import { DefaultLaunchOptionsProvider } from './default-launch-options-provider';
import { DefaultModelServerLauncher } from './default-model-server-launcher';
import { ModelServerLauncher } from './model-server-launcher';

export default new ContainerModule(bind => {
    bind(LaunchOptionsProvider).to(DefaultLaunchOptionsProvider).inSingletonScope();

    bind(ConnectionHandler).toDynamicValue(ctx => {
        const targetFactory: () => LaunchOptionsProvider = () => ctx.container.get<LaunchOptionsProvider>(LaunchOptionsProvider);
        return new JsonRpcConnectionHandler(LAUNCH_OPTIONS_PROVIDER_SERVICE,
            targetFactory
        );
    }).inSingletonScope();
    bind(DefaultModelServerLauncher).toSelf().inSingletonScope();
    bind(ModelServerLauncher).toService(DefaultModelServerLauncher);
    bind(BackendApplicationContribution).toService(DefaultModelServerLauncher);

    bind(TheiaModelServerClient).toSelf().inSingletonScope();

});

