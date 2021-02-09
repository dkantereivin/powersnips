import * as vscode from 'vscode';
import { SNIPPET_FOLDER_PATH_CONFIG_KEY } from './constants';
import { getPluginConfig, isSetupCompleted, defaultSnippetDir } from './PluginUtils';
import { SnippetLoader } from './SnippetLoader';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {

	if (!isSetupCompleted()) {
		const config = getPluginConfig();
		const path = defaultSnippetDir();
		config.update(SNIPPET_FOLDER_PATH_CONFIG_KEY, path, vscode.ConfigurationTarget.Workspace);
		config.update(SNIPPET_FOLDER_PATH_CONFIG_KEY, path, vscode.ConfigurationTarget.Global);
		if (!fs.existsSync(path))
			fs.mkdirSync(path, {recursive: true});
		vscode.window.showInformationMessage('Thanks for installing PowerSnips! The extension setup has successfully completed.');
	}

	// let disposable = vscode.commands.registerCommand('powersnips.helloWorld', () => {
	// 	vscode.window.showInformationMessage('Hello World from PowerSnips!');
	// });

	// context.subscriptions.push(disposable);

	context.subscriptions.push(
		vscode.commands.registerCommand('powersnips.loadSnippets', () => {
			const snippets = SnippetLoader.loadSnippets();
		})
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}
