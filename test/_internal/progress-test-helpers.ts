import type { createSpinner, Spinner } from "nanospinner";

import { EventEmitter } from "node:events";
import { stripVTControlCharacters } from "node:util";

import {
    internals,
    type NormalizedProgressSettings,
} from "../../src/_internal/progress-runtime.js";

export const stripAnsi = (value: string): string =>
    stripVTControlCharacters(value);

export const normalizePathSeparators = (value: string): string =>
    value.replaceAll("\\", "/");

export const makeSettings = (
    overrides: Partial<NormalizedProgressSettings> = {}
): NormalizedProgressSettings => ({
    ...internals.defaultSettings,
    ...overrides,
});

type SummaryStats = Parameters<typeof internals.formatSuccessMessage>[1];

export const makeStats = (
    overrides: Partial<SummaryStats> = {}
): SummaryStats => ({
    durationMs: 900,
    exitCode: 0,
    filesLinted: 3,
    ...overrides,
});

export interface MockProcess {
    readonly cwd: () => string;
    readonly emitBeforeExit: (exitCode: number) => boolean;
    readonly emitExit: (exitCode: number) => boolean;
    readonly once: NodeJS.Process["once"];
    readonly stderr: MockWriteStream<2>;
    readonly stdout: MockWriteStream<1>;
}

export interface MockSpinnerEvent {
    readonly method: SpinnerMethod;
    readonly payload?: unknown;
}

export interface MockSpinnerRecord {
    readonly events: MockSpinnerEvent[];
    readonly options: SpinnerCreateOptions | undefined;
    readonly spinner: Spinner;
    readonly text: string;
}

export interface MockWriteStream<Fd extends 1 | 2 = 1 | 2>
    extends NodeJS.WriteStream {
    fd: Fd;
    readonly writes: string[];
}

interface GetLatestSpinnerRecordOptions {
    readonly created: readonly MockSpinnerRecord[];
}

type SpinnerCreateOptions = NonNullable<Parameters<typeof createSpinner>[1]>;

type SpinnerMethod =
    | "clear"
    | "error"
    | "info"
    | "loop"
    | "render"
    | "reset"
    | "spin"
    | "start"
    | "stop"
    | "success"
    | "update"
    | "warn"
    | "write";

const recordEvent = (
    method: SpinnerMethod,
    payload?: unknown
): MockSpinnerEvent =>
    payload === undefined
        ? { method }
        : {
              method,
              payload,
          };

export const createMockSpinnerFactory = (): {
    readonly created: MockSpinnerRecord[];
    readonly spinnerFactory: (
        text?: string,
        options?: Readonly<SpinnerCreateOptions>
    ) => Spinner;
} => {
    const created: MockSpinnerRecord[] = [];

    const spinnerFactory = (
        text = "",
        options?: Readonly<SpinnerCreateOptions>
    ): Spinner => {
        const events: MockSpinnerEvent[] = [];
        let spinning = false;

        const spinner: Spinner = {
            clear() {
                events.push(recordEvent("clear"));
                return spinner;
            },
            error(payload) {
                spinning = false;
                events.push(recordEvent("error", payload));
                return spinner;
            },
            info(payload) {
                events.push(recordEvent("info", payload));
                return spinner;
            },
            isSpinning() {
                return spinning;
            },
            loop() {
                events.push(recordEvent("loop"));
                return spinner;
            },
            render() {
                events.push(recordEvent("render"));
                return spinner;
            },
            reset() {
                spinning = false;
                events.push(recordEvent("reset"));
                return spinner;
            },
            spin() {
                spinning = true;
                events.push(recordEvent("spin"));
                return spinner;
            },
            start(payload) {
                spinning = true;
                events.push(recordEvent("start", payload));
                return spinner;
            },
            stop(payload) {
                spinning = false;
                events.push(recordEvent("stop", payload));
                return spinner;
            },
            success(payload) {
                spinning = false;
                events.push(recordEvent("success", payload));
                return spinner;
            },
            update(payload) {
                events.push(recordEvent("update", payload));
                return spinner;
            },
            warn(payload) {
                events.push(recordEvent("warn", payload));
                return spinner;
            },
            write(payload, clear) {
                events.push(
                    recordEvent("write", {
                        clear,
                        payload,
                    })
                );
                return spinner;
            },
        };

        created.push({
            events,
            options,
            spinner,
            text,
        });

        return spinner;
    };

    return {
        created,
        spinnerFactory,
    };
};

export const createMockWriteStream = <Fd extends 1 | 2 = 1>(
    overrides: Readonly<
        Partial<Pick<MockWriteStream<Fd>, "columns" | "fd" | "isTTY">>
    > = {}
): MockWriteStream<Fd> => {
    const writes: string[] = [];
    const fd = (overrides.fd ?? 1) as Fd;

    return {
        columns: overrides.columns ?? 120,
        fd,
        isTTY: overrides.isTTY ?? true,
        write(chunk: Readonly<Uint8Array> | string): boolean {
            writes.push(
                typeof chunk === "string"
                    ? chunk
                    : Buffer.from(chunk).toString()
            );
            return true;
        },
        writes,
    } as unknown as MockWriteStream<Fd>;
};

export const createMockProcess = (
    streams: Readonly<Partial<Pick<MockProcess, "stderr" | "stdout">>> = {}
): MockProcess => {
    // eslint-disable-next-line unicorn/prefer-event-target -- Node.js process.once semantics are EventEmitter-based, so the mock matches that API directly.
    const emitter = new EventEmitter();
    const stdout =
        streams.stdout ?? createMockWriteStream({ fd: 1, isTTY: true });
    const stderr =
        streams.stderr ?? createMockWriteStream({ fd: 2, isTTY: true });

    return {
        cwd: () => "/repo",
        emitBeforeExit: (exitCode: number) =>
            emitter.emit("beforeExit", exitCode),
        emitExit: (exitCode: number) => emitter.emit("exit", exitCode),
        once: emitter.once.bind(emitter) as NodeJS.Process["once"],
        stderr,
        stdout,
    };
};

export const getLatestSpinnerRecord = (
    options: Readonly<GetLatestSpinnerRecordOptions>
): MockSpinnerRecord => {
    const { created } = options;
    const latestRecord = created.at(-1);

    if (latestRecord === undefined) {
        throw new Error(
            "Expected at least one mock spinner to have been created."
        );
    }

    return latestRecord;
};
