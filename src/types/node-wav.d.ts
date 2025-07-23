declare module 'node-wav' {
    interface EncodeOptions {
        sampleRate?: number;
        bitDepth?: number;
        channels?: number;
    }

    interface WavResult {
        sampleRate: number;
        channelData: Float32Array[];
    }

    export function encode(channelData: Float32Array[], options?: EncodeOptions): ArrayBuffer;
    export function decode(buffer: ArrayBuffer): WavResult;
}
