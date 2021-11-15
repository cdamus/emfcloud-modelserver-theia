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
import { inject, injectable, optional } from '@theia/core/shared/inversify';

import { DEFAULT_LAUNCH_OPTIONS, LaunchOptions, LaunchOptionsProvider } from '../common/launch-options-provider';

@injectable()
export class DefaultLaunchOptionsProvider implements LaunchOptionsProvider {
    @inject(LaunchOptions) @optional() protected readonly options: LaunchOptions = DEFAULT_LAUNCH_OPTIONS;

    async getLaunchOptions(): Promise<LaunchOptions> {
        return this.options;
    }

}
