import {DefinitionInfo, ImplementationLocation, LanguageServiceHost, Node, QuickInfo, ReferencedSymbol, SourceFile} from "typescript";
import {ITypescriptLanguageServiceAddFileOptions} from "./i-typescript-language-service-add-file-options";
import {ITypescriptLanguageServiceGetFileOptions} from "./i-typescript-language-service-get-file-options";
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

export interface ITypescriptLanguageService extends LanguageServiceHost {
	setOptions (options?: Partial<ITypescriptLanguageServiceOptions>): void;
	excludeFiles (match: RegExp|Iterable<RegExp>): void;
	getPathInfo (options: (ITypescriptLanguageServiceGetPathInfoOptions&{ content?: string })|(ITypescriptLanguageServiceAddPath&{ content?: string })): ITypescriptLanguageServicePathInfo;
	getAddPath (path: string, from?: string): ITypescriptLanguageServiceAddPath;
	addFile (options: (ITypescriptLanguageServiceAddFileOptions&ITypescriptLanguageServiceAddImportedFiles)|(ITypescriptLanguageServicePathInfo&ITypescriptLanguageServiceAddImportedFiles)): SourceFile;
	getFile (options: ITypescriptLanguageServiceGetFileOptions|ITypescriptLanguageServicePathInfo): SourceFile;
	removeFile (fileName: string): void;
	getFileVersion (filePath: string): number;
	getFileContent (fileName: string, isTemporary?: boolean): ITypescriptLanguageServiceContent;
	getQuickInfoAtPosition (filename: string, position: number): QuickInfo;
	getQuickInfoForStatement (statement: Node): QuickInfo;
	getDefinitionAtPosition (filename: string, position: number): DefinitionInfo[];
	getDefinitionAtStatement (statement: Node): DefinitionInfo[];
	getTypeDefinitionAtPosition (filename: string, position: number): DefinitionInfo[];
	getTypeDefinitionAtStatement (statement: Node): DefinitionInfo[];
	findReferencesForPosition (filename: string, position: number): ReferencedSymbol[];
	findReferencesForStatement (statement: Node): ReferencedSymbol[];
	getImplementationAtPosition (filename: string, position: number): ImplementationLocation[];
	getImplementationForStatement (statement: Node): ImplementationLocation[];
	getImportedFilesForFile (filename: string): ITypescriptLanguageServiceImportPath[];
	getImportedFilesForStatementFile (statement: Node): ITypescriptLanguageServiceImportPath[];
	getImportedFilesForContent (content: string, from: string): ITypescriptLanguageServiceImportPath[];
}

export interface ITypescriptLanguageServiceConstructor {
	new (moduleUtil: IModuleUtil, pathUtil: IPathUtil, fileLoader: IFileLoader): ITypescriptLanguageService;
}