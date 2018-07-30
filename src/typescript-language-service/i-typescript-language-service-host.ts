import {DefinitionInfo, ImplementationLocation, LanguageServiceHost, Node, QuickInfo, ReferencedSymbol, SourceFile} from "typescript";
import {ITypescriptLanguageServiceAddFileOptions} from "./i-typescript-language-service-add-file-options";
import {IModuleUtil} from "@wessberg/moduleutil";
import {IPathUtil} from "@wessberg/pathutil";
import {IFileLoader} from "@wessberg/fileloader";
import {ITypescriptLanguageServiceContent} from "./i-typescript-language-service-content";
import {ITypescriptLanguageServiceAddPath} from "./i-typescript-language-service-add-path";
import {ITypescriptLanguageServicePathInfo} from "./i-typescript-language-service-path-info";
import {ITypescriptLanguageServiceAddImportedFiles} from "./i-typescript-language-service-add-imported-files";
import {ITypescriptLanguageServiceImportPath} from "./i-typescript-language-service-import-path";
import {ITypescriptLanguageServiceGetPathInfoOptions} from "./i-typescript-language-service-get-path-info-options";
import {ITypescriptLanguageServiceOptions} from "./i-typescript-language-service-options";
import {IGetFileOptions} from "./i-get-file-options";

export interface ITypescriptLanguageServiceHost extends LanguageServiceHost {
	setOptions (options?: Partial<ITypescriptLanguageServiceOptions>): void;
	excludeFiles (match: RegExp|Iterable<RegExp>): void;
	getPathInfo (options: (ITypescriptLanguageServiceGetPathInfoOptions&{ content?: string })|(ITypescriptLanguageServiceAddPath&{ content?: string })): ITypescriptLanguageServicePathInfo;
	getAddPath (path: string, from?: string): ITypescriptLanguageServiceAddPath;
	addFile (options: (ITypescriptLanguageServiceAddFileOptions&ITypescriptLanguageServiceAddImportedFiles)|(ITypescriptLanguageServicePathInfo&ITypescriptLanguageServiceAddImportedFiles)): SourceFile;
	getFile (options: IGetFileOptions): SourceFile;
	removeFile (fileName: string): void;
	getFileVersion (filePath: string): number;
	getFileContent (fileName: string, isTemporary?: boolean): ITypescriptLanguageServiceContent;
	getQuickInfoAtPosition (filename: string, position: number): QuickInfo|undefined;
	getQuickInfoForStatement (statement: Node): QuickInfo|undefined;
	getDefinitionAtPosition (filename: string, position: number): DefinitionInfo[]|undefined;
	getDefinitionAtStatement (statement: Node): DefinitionInfo[]|undefined;
	getTypeDefinitionAtPosition (filename: string, position: number): DefinitionInfo[]|undefined;
	getTypeDefinitionAtStatement (statement: Node): DefinitionInfo[]|undefined;
	findReferencesForPosition (filename: string, position: number): ReferencedSymbol[]|undefined;
	findReferencesForStatement (statement: Node): ReferencedSymbol[]|undefined;
	getImplementationAtPosition (filename: string, position: number): ImplementationLocation[]|undefined;
	getImplementationForStatement (statement: Node): ImplementationLocation[]|undefined;
	getImportedFilesForFile (filename: string): ITypescriptLanguageServiceImportPath[];
	getImportedFilesForStatementFile (statement: Node): ITypescriptLanguageServiceImportPath[];
	getImportedFilesForContent (content: string, from: string): ITypescriptLanguageServiceImportPath[];
}

export interface ITypescriptLanguageServiceHostConstructor {
	new (moduleUtil: IModuleUtil, pathUtil: IPathUtil, fileLoader: IFileLoader): ITypescriptLanguageServiceHost;
}