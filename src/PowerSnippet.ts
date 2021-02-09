export const INTERPOLATION_VARIABLES: Map<string, () => string> = new Map();

export type PowerSnippetFlags = {
    automatic?: boolean;
    multiline?: boolean;
    searchInWord?: boolean;
    wordBoundary?: boolean;

};

export type TriggerActivationEvent = {
    triggerLine: string;
    triggerPosition: number;
};

export class PowerSnippet {
    public trigger: string | RegExp;
    public description: string;
    public body: string | ((...args: string[]) => string);
    public shouldActivate: ((activationEvent: TriggerActivationEvent) => boolean | Promise<boolean>)[] = [];
    public flags: PowerSnippetFlags = {};

    constructor(trigger: string | RegExp, description: string, body: string | ((...args: string[]) => string)) {
        this.trigger = trigger;
        this.description = description;
        this.body = body;
    }
}