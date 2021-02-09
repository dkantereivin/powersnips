export const INTERPOLATION_VARIABLES: Map<string, () => string> = new Map();

export type PowerSnippetFlags = {
    automatic?: boolean;
    multiline?: boolean;
    searchInWord?: boolean;
    wordBoundary?: boolean;
    onlyStartLine?: boolean;
};

export type TriggerActivationEvent = {
    triggerText: string;
    triggerLine: string;
    triggerPosition: number;
};

export class PowerSnippet {
    public trigger: string | RegExp;
    public description: string;
    public body: string | ((...args: string[]) => string);
    public shouldActivate: ((activationEvent: TriggerActivationEvent) => boolean | Promise<boolean>)[];
    public flags: PowerSnippetFlags;

    constructor(
        trigger: PowerSnippet['trigger'],
        description: PowerSnippet['description'],
        body: PowerSnippet['body'],
        flags: PowerSnippet['flags'] = {},
        customShouldActivate: PowerSnippet['shouldActivate'] = []
        ) {
        this.trigger = trigger;
        this.description = description;
        this.body = body;
        this.flags = flags;
        this.shouldActivate = customShouldActivate;
    }

    // TODO: add shouldActivate standard functions
}