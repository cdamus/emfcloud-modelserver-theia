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
import { BackendApplicationContribution } from '@theia/core/lib/node';
import { inject, injectable, optional } from '@theia/core/shared/inversify';
import { ProcessErrorEvent, ProcessManager, RawProcess, RawProcessFactory } from '@theia/process/lib/node';
import * as cp from 'child_process';

import { DEFAULT_LAUNCH_OPTIONS, LaunchOptions } from '../common/launch-options-provider';
import { TheiaModelServerClient } from '../common/theia-model-server-client';
import { ModelServerLauncher } from './model-server-launcher';

@injectable()
export class DefaultModelServerLauncher implements ModelServerLauncher, BackendApplicationContribution {
    @inject(LaunchOptions) @optional() protected readonly launchOptions: LaunchOptions = DEFAULT_LAUNCH_OPTIONS;
    @inject(RawProcessFactory) protected readonly processFactory: RawProcessFactory;
    @inject(ProcessManager) protected readonly processManager: ProcessManager;
    @inject(TheiaModelServerClient) protected readonly modelserverClient: TheiaModelServerClient;

    async initialize(): Promise<void> {
        try {
            await this.modelserverClient.ping();
        } catch {
            this.logInfo('Modelserver is not running or reachable. Trying to start modelserver from jar');
            this.startServer();
        }
        await this.startServer();

    }

    async startServer(): Promise<boolean> {
        if (this.launchOptions.jarPath) {
            let args = ['-jar', this.launchOptions.jarPath, '--port', `${this.launchOptions.serverPort}`];
            if (this.launchOptions.additionalArgs) {
                args = [...args, ...this.launchOptions.additionalArgs];
            }
            this.spawnProcessAsync('java', args);
        } else {
            this.logError('Could not start model server. No path to executable is specified');
            return false;
        }
        return true;
    }

    protected spawnProcessAsync(command: string, args?: string[], options?: cp.SpawnOptions): Promise<RawProcess> {
        const rawProcess = this.processFactory({ command, args, options });
        rawProcess.errorStream.on('data', this.logError.bind(this));
        rawProcess.outputStream.on('data', this.logInfo.bind(this));
        return new Promise<RawProcess>((resolve, reject) => {
            rawProcess.onError((error: ProcessErrorEvent) => {
                this.onDidFailSpawnProcess(error);
                if (error.code === 'ENOENT') {
                    const guess = command.split(/\s+/).shift();
                    if (guess) {
                        reject(new Error(`Failed to spawn ${guess}\nPerhaps it is not on the PATH.`));
                        return;
                    }
                }
                reject(error);
            });
            process.nextTick(() => resolve(rawProcess));
        });
    }

    protected onDidFailSpawnProcess(error: Error | ProcessErrorEvent): void {
        this.logError(error.message);
    }

    protected logError(data: string | Buffer): void {
        if (data) {
            console.error(`ModelServerBackendContribution: ${data}`);
        }
    }

    protected logInfo(data: string | Buffer): void {
        if (data) {
            console.info(`ModelServerBackendContribution: ${data}`);
        }
    }

    dispose?(): void;

    onStop(): void {
        this.dispose?.();
    }

}
