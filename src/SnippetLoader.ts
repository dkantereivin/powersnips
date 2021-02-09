import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {promisify} from 'util';
import { FILE_EXTENSION, FILE_EXTENSION_GLOB } from './constants';
import { getSnippetFolderPath } from './PluginUtils';
import {xml2js} from 'xml-js';
import { PowerSnippet } from './PowerSnippet';

const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

type SnippetFile = {
    lang: string;
    content: string;
};

type SnippetTemplate = {
    _attributes?: {
        description?: string;
        automatic?: string;
        multiline?: string;
        searchInWord?: string;
        wordBoundary?: string;
        onlyStartLine?: string;
    };

    trigger: {
        _attributes?: {
            regex?: string; // bool
        }
        _text: string;
    };

    body: {
        _attributes?: {
            script?: string; // bool
        }
        _text: string;
    }

    shouldActivate?: {
        _text: string;
    }
};

export class SnippetLoader {
    public static async loadSnippets(): Promise<Map<string, PowerSnippet[]>> {
        const snippetFilesRaw = await SnippetLoader.getSnippetFilesRaw();
        const snippets: Map<string, PowerSnippet[]> = new Map();

        for (const file of snippetFilesRaw) {
            try {
                snippets.set(file.lang, SnippetLoader.parseSnippetFile(file.content));
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`Failed to add some or all ${file.lang} snippets. Check the Developer Tools Console for the error message.`);
            }
        }

        return snippets;
    }

    private static async getSnippetFilesRaw(): Promise<SnippetFile[]> {
        const dirPath = getSnippetFolderPath();
        const workspaceSnippetPaths: string[] = (await vscode.workspace.findFiles(FILE_EXTENSION_GLOB))
            .map(uri => uri.fsPath);

        const globalSnippetPaths: string[] = (await readDir(dirPath, {withFileTypes: true}))
            .filter(entry => entry.isFile())
            .map(entry => path.join(dirPath, entry.name));

        const snippetPaths = [...globalSnippetPaths, ...workspaceSnippetPaths]
            .filter(fsPath => path.extname(fsPath.toLowerCase()) === FILE_EXTENSION);

        const snippetFiles: Promise<SnippetFile>[] = snippetPaths.map(async (fsPath: string) => ({
            lang: path.basename(fsPath, FILE_EXTENSION),
            content: await readFile(fsPath, {encoding: 'utf8'})
        }));

        return await Promise.all(snippetFiles);
    }

    private static parseSnippetFile(xmlSnippetFile: string): PowerSnippet[] {
        const parsed = xml2js(xmlSnippetFile, {
            compact: true,
            trim: true,
            ignoreDeclaration: true,
            ignoreComment: true
        }) as {snippets: {snippet: SnippetTemplate[]}};
        const snippets: SnippetTemplate[] | PowerSnippet[] = parsed.snippets.snippet;

        return snippets.map(s => {
            const regexTrigger: boolean = SnippetLoader.isAttributeTrue(s.trigger, 'regex');
            const bodyIsScript: boolean = SnippetLoader.isAttributeTrue(s.body, 'script');
            const snippet = new PowerSnippet(
                regexTrigger ? new RegExp(s.trigger._text) : s.trigger._text,
                s.hasOwnProperty('_attributes') ? s._attributes?.description || s.trigger._text : s.trigger._text,
                bodyIsScript ? eval(s.body._text) : s.body._text, // TODO: remove the extra indentation/whitespace where it shouldn't be
                {
                    automatic: SnippetLoader.isAttributeTrue(s, 'automatic'),
                    multiline: SnippetLoader.isAttributeTrue(s, 'multiline'),
                    searchInWord: SnippetLoader.isAttributeTrue(s, 'searchInWord'),
                    wordBoundary: SnippetLoader.isAttributeTrue(s, 'wordBoundary'),
                    onlyStartLine: SnippetLoader.isAttributeTrue(s, 'onlyStartLine')
                },
                s.hasOwnProperty('shouldActivate') ? eval(<string>s.shouldActivate?._text) : []
            );
            return snippet;
        });
    }

    private static isAttributeTrue(obj: Object, attributeName: string): boolean {
        return obj.hasOwnProperty('_attributes') && (<any>obj)._attributes[attributeName] === 'true';
    }
}