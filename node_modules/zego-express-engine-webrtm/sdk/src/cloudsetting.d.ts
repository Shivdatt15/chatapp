import { ZegoLogger } from './zego.entity';
export declare class CloudSetting {
    zegoSetting: any;
    isLoad: boolean;
    callBackList: Array<Function>;
    constructor();
    setLog(logger: ZegoLogger): void;
    init(initOptions: any): void;
    setEnvVariable(key: string, value: number | string): void;
    getEnvVariables(): any;
    fetchSetting(cloudFileName: string, params?: {}, needPolling?: boolean): Promise<any>;
    fetchMultiSetting(cloudFileNames: string[], params?: {}, needPolling?: boolean): Promise<any>;
    setOptions(config?: {
        unify: boolean;
    }): void;
    getSettingCache(cloudFileName: string): Promise<any>;
    setToken(token: string): void;
    setUserID(userID: string): void;
    activePolling(): void;
    uninit(): void;
    getEnvVariable(val: string): void;
}
