export class MissingConfigurationException extends Error {
    constructor(configKey: string = 'unspecified', message: string = '') {
        super(
            `PowerSnips is Missing Key: \`${configKey}\`. ${message}`
        );
    }
}