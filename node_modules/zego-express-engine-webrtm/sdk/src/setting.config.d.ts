export declare class ZegoSettingConfig {
    static instance: ZegoSettingConfig;
    defaultSetting: any;
    setting: any;
    requestList: any;
    constructor();
    setSetting(settingFile: any, changeItems?: string[]): void;
    getSetting(key: string, force?: boolean): any;
}
