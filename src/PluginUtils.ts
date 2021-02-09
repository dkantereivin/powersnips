import * as vscode from 'vscode';
import { SNIPPET_FOLDER_INITIAL_SETTING, SNIPPET_FOLDER_PATH_CONFIG_KEY } from './constants';
import { MissingConfigurationException } from './exceptions/MissingConfigurationException';
import * as path from 'path';
import * as os from 'os';

export function isSetupCompleted(): boolean {
    console.log(os.platform());
    if (getSnippetFolderPath() === SNIPPET_FOLDER_INITIAL_SETTING)
        return false;
    return true;
}

export function getPluginConfig(): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration();
}

export function getSnippetFolderPath(config = getPluginConfig()): string {
    if (!config.has(SNIPPET_FOLDER_PATH_CONFIG_KEY))
        throw new MissingConfigurationException(SNIPPET_FOLDER_PATH_CONFIG_KEY);
    return config.get(SNIPPET_FOLDER_PATH_CONFIG_KEY) as string;
}

export function defaultSnippetDir(): string {
    const platform: string = os.platform();
    switch (platform) {
        case 'win32':
            return path.join(<string>process.env.APPDATA, 'Code/User/psnips');
        case 'darwin':
            return path.join(<string>process.env.HOME, 'Library/Application Support/Code/User/psnips');
        case 'linux':
            return path.join(<string>process.env.HOME, '.config/Code/User/psnips');
        default:
            if (!(process.env.APPDATA || process.env.HOME)) {
                vscode.window.showErrorMessage("PowerSnips couldn't set a default snippet directory. Please set one manually in the extension preferences; until then, the extension will not function.");
                throw new MissingConfigurationException(SNIPPET_FOLDER_INITIAL_SETTING, 'Unable to set a default snippet folder, likely due to unsupported OS.');
            }
            vscode.window.showWarningMessage('Your OS is unsupported by PowerSnips. Please verify a valid snippet folder path in the extension preferences.');
            return (process.env.APPDATA || process.env.HOME) + '.config/Code/User/psnips';
    }
}