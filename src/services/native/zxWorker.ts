import 'source-map-support/register';
import { expose } from 'threads/worker';
import { fork } from 'child_process';
import { tmpdir } from 'os';
import { mkdtemp, writeFile } from 'fs-extra';
import path from 'path';
import { Observable } from 'rxjs';
import intercept from 'intercept-stdout';

import { fixPath } from '@services/libs/fixPath';
import { IZxWorkerMessage, ZxWorkerControlActions } from './interface';

fixPath();

export type IZxFileInput = { fileContent: string; fileName: string } | { filePath: string };
function executeZxScript(file: IZxFileInput, zxPath: string): Observable<IZxWorkerMessage> {
  return new Observable<IZxWorkerMessage>((observer) => {
    observer.next({ type: 'control', actions: ZxWorkerControlActions.start });
    intercept(
      (newStdOut: string) => {
        observer.next({ type: 'stdout', message: newStdOut });
      },
      (newStdError: string) => {
        observer.next({ type: 'stderr', message: newStdError });
      },
    );

    void (async function executeZxScriptIIFE() {
      try {
        let filePathToExecute = '';
        if ('fileName' in file) {
          const temporaryDirectory = await mkdtemp(`${tmpdir()}${path.sep}`);
          filePathToExecute = path.join(temporaryDirectory, file.fileName);
          await writeFile(filePathToExecute, file.fileContent);
        } else if ('filePath' in file) {
          filePathToExecute = file.filePath;
        }
        const execution = fork(zxPath, [filePathToExecute], { silent: true });

        execution.on('close', function (code) {
          observer.next({ type: 'control', actions: ZxWorkerControlActions.ended, message: `child process exited with code ${String(code)}` });
        });
        execution.stdout?.on('data', (stdout: Buffer) => {
          observer.next({ type: 'stdout', message: String(stdout) });
        });
        execution.stderr?.on('data', (stdout: Buffer) => {
          observer.next({ type: 'stderr', message: String(stdout) });
        });
      } catch (error) {
        const message = `zx script's executeZxScriptIIFE() failed with error ${(error as Error).message} ${(error as Error).stack ?? ''}`;
        observer.next({ type: 'control', actions: ZxWorkerControlActions.error, message });
      }
    })();
  });
}

const zxWorker = { executeZxScript };
export type ZxWorker = typeof zxWorker;
expose(zxWorker);