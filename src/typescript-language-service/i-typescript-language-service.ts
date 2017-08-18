import {DefinitionInfo, Expression, ImplementationLocation, LanguageServiceHost, Node, ReferencedSymbol, Statement} from "typescript";
import {ITypescriptLanguageServiceAddFileOptions} from "./i-typescript-language-service-add-file-options";
import {ITypescriptLanguageServiceGetFileOptions} from "./i-typescript-language-service-get-file-options";
import {IModuleUtil} from "@wessberg/moduleutil";
import {IPathUtil} from "@wessberg/pathutil";
import {IFileLoader} from "@wessberg/fileloader";

export interface ITypescriptLanguageService extends LanguageServiceHost {
	addFile (options: ITypescriptLanguageServiceAddFileOptions): Statement[];
	getFile (options: ITypescriptLanguageServiceGetFileOptions): Statement[];
	removeFile (fileName: string): void;
	getFileVersion (filePath: string): number;
	getFileContent (fileName: string, isTemporary?: boolean): string;
	getDefinitionAtPosition (filename: string, position: number): void;
	getDefinitionAtStatement (statement: Statement|Node|Expression): void;
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