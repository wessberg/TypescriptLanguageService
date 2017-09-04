import {DefinitionInfo, Expression, ImplementationLocation, LanguageServiceHost, Node, ReferencedSymbol, Statement, NodeArray} from "typescript";
import {ITypescriptLanguageServiceAddFileOptions} from "./i-typescript-language-service-add-file-options";
import {ITypescriptLanguageServiceGetFileOptions} from "./i-typescript-language-service-get-file-options";
import {IModuleUtil} from "@wessberg/moduleutil";
import {IPathUtil} from "@wessberg/pathutil";
import {IFileLoader} from "@wessberg/fileloader";
import {ITypescriptLanguageServiceContent} from "./i-typescript-language-service-content";
import {ITypescriptLanguageServiceAddPath} from "./i-typescript-language-service-add-path";
import {ITypescriptLanguageServicePathInfo} from "./i-typescript-language-service-path-info";
import {ITypescriptLanguageServiceAddImportedFiles} from "./i-typescript-language-service-add-imported-files";

export interface ITypescriptLanguageService extends LanguageServiceHost {
	excludeFiles (match: RegExp|Iterable<RegExp>): void;
	getPathInfo (path: string, from?: string, content?: string): ITypescriptLanguageServicePathInfo;
	getAddPath (path: string, from?: string): ITypescriptLanguageServiceAddPath;
	addFile (options: (ITypescriptLanguageServiceAddFileOptions & ITypescriptLanguageServiceAddImportedFiles)|(ITypescriptLanguageServicePathInfo & ITypescriptLanguageServiceAddImportedFiles)): NodeArray<Statement>;
	getFile (options: ITypescriptLanguageServiceGetFileOptions|ITypescriptLanguageServicePathInfo): NodeArray<Statement>;
	removeFile (fileName: string): void;
	getFileVersion (filePath: string): number;
	getFileContent (fileName: string, isTemporary?: boolean): ITypescriptLanguageServiceContent;
	getDefinitionAtPosition (filename: string, position: number): DefinitionInfo[];
	getDefinitionAtStatement (statement: Statement|Node|Expression): DefinitionInfo[];
	getTypeDefinitionAtPosition (filename: string, position: number): DefinitionInfo[];
	getTypeDefinitionAtStatement (statement: Statement|Expression|Node): DefinitionInfo[];
	findReferencesForPosition (filename: string, position: number): ReferencedSymbol[];
	findReferencesForStatement (statement: Statement|Expression|Node): ReferencedSymbol[];
	getImplementationAtPosition (filename: string, position: number): ImplementationLocation[];
	getImplementationForStatement (statement: Statement|Expression|Node): ImplementationLocation[];
	getImportedFilesForFile (filename: string): string[];
	getImportedFilesForStatementFile (statement: Statement|Expression|Node): string[];
	getImportedFilesForContent (content: string, from: string): string[];
}

export interface ITypescriptLanguageServiceConstructor {
	new (moduleUtil: IModuleUtil, pathUtil: IPathUtil, fileLoader: IFileLoader): ITypescriptLanguageService;
}