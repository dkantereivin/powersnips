import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {promisify} from 'util';
import { FILE_EXTENSION, FILE_EXTENSION_GLOB } from './constants';
import { getSnippetFolderPath } from './PluginUtils';

const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

type SnippetFile = {
    lang: string;
    content: string;
};

export class SnippetLoader {
    public static async loadSnippets(): Promise<void> {
        const snippets: Map<string, any> = new Map();
        const files = await SnippetLoader.getSnippetFiles();
        console.log(files);
    }

    private static async getSnippetFiles(): Promise<SnippetFile[]> {
        const dirPath = getSnippetFolderPath();
        const workspaceSnippetPaths: string[] = (await vscode.workspace.findFiles(FILE_EXTENSION_GLOB))
            .map(uri => uri.fsPath);

        const globalSnippetPaths: string[] = (await readDir(dirPath, {withFileTypes: true}))
            .filter(entry => entry.isFile())
            .map(entry => path.join(dirPath, entry.name));

        const snippetPaths = [...workspaceSnippetPaths, ...globalSnippetPaths]
            .filter(fsPath => path.extname(fsPath.toLowerCase()) === FILE_EXTENSION);

        const snippetFiles: Promise<SnippetFile>[] = snippetPaths.map(async (fsPath: string) => ({
            lang: path.basename(fsPath, FILE_EXTENSION),
            content: await readFile(fsPath, {encoding: 'utf8'})
        }));

        return await Promise.all(snippetFiles);
    }
}