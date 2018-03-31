import {CompilerOptions, DefinitionInfo, ImplementationLocation, IScriptSnapshot, Node, QuickInfo, ReferencedSymbol, SourceFile} from "typescript";
import {ITypescriptLanguageService} from "./i-typescript-language-service";
import {ITypescriptLanguageServiceAddFileOptions} from "./i-typescript-language-service-add-file-options";
import {ITypescriptLanguageServiceAddImportedFiles} from "./i-typescript-language-service-add-imported-files";
import {ITypescriptLanguageServicePathInfo} from "./i-typescript-language-service-path-info";
import {ITypescriptLanguageServiceAddPath} from "./i-typescript-language-service-add-path";
import {IGetFileOptions} from "./i-get-file-options";
import {ITypescriptLanguageServiceContent} from "./i-typescript-language-service-content";
import {ITypescriptLanguageServiceImportPath} from "./i-typescript-language-service-import-path";
import {ITypescriptLanguageServiceGetPathInfoOptions} from "./i-typescript-language-service-get-path-info-options";
import {ITypescriptLanguageServiceOptions} from "./i-typescript-language-service-options";
import {DIContainer} from "@wessberg/di";
import {ITypescriptLanguageServiceHost} from "./i-typescript-language-service-host";

/**
 * A TypescriptLanguageService class meant for public consumption. This shadows the actual TypescriptLanguageService class to ensure
 * that it can be used without having to dependency inject it when clients consume it.
 */
export class TypescriptLanguageService implements ITypescriptLanguageService {

	constructor () {
		return DIContainer.get<ITypescriptLanguageServiceHost>();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @param {(ITypescriptLanguageServiceAddFileOptions & ITypescriptLanguageServiceAddImportedFiles) | (ITypescriptLanguageServicePathInfo & ITypescriptLanguageServiceAddImportedFiles)} _options
	 * @returns {SourceFile}
	 */
	public addFile (_options: (ITypescriptLanguageServiceAddFileOptions&ITypescriptLanguageServiceAddImportedFiles)|(ITypescriptLanguageServicePathInfo&ITypescriptLanguageServiceAddImportedFiles)): SourceFile {
		throw new Error();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @param {RegExp | Iterable<RegExp>} _match
	 */
	public excludeFiles (_match: RegExp|Iterable<RegExp>): void {
		throw new Error();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @param {string} _filename
	 * @param {number} _position
	 * @returns {ReferencedSymbol[]}
	 */
	public findReferencesForPosition (_filename: string, _position: number): ReferencedSymbol[] {
		throw new Error();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @param {ts.Node} _statement
	 * @returns {ReferencedSymbol[]}
	 */
	public findReferencesForStatement (_statement: Node): ReferencedSymbol[] {
		throw new Error();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @param {string} _path
	 * @param {string} _from
	 * @returns {ITypescriptLanguageServiceAddPath}
	 */
	public getAddPath (_path: string, _from?: string): ITypescriptLanguageServiceAddPath {
		throw new Error();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @returns {CompilerOptions}
	 */
	public getCompilationSettings (): CompilerOptions {
		throw new Error();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @returns {string}
	 */
	public getCurrentDirectory (): string {
		throw new Error();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @param {CompilerOptions} _options
	 * @returns {string}
	 */
	public getDefaultLibFileName (_options: CompilerOptions): string {
		throw new Error();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @param {string} _filename
	 * @param {number} _position
	 * @returns {DefinitionInfo[]}
	 */
	public getDefinitionAtPosition (_filename: string, _position: number): DefinitionInfo[] {
		throw new Error();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @param {Node} _statement
	 * @returns {DefinitionInfo[]}
	 */
	public getDefinitionAtStatement (_statement: Node): DefinitionInfo[] {
		throw new Error();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @param {IGetFileOptions} _options
	 * @returns {SourceFile}
	 */
	public getFile (_options: IGetFileOptions): SourceFile {
		throw new Error();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @param {string} _fileName
	 * @param {boolean} _isTemporary
	 * @returns {ITypescriptLanguageServiceContent}
	 */
	public getFileContent (_fileName: string, _isTemporary?: boolean): ITypescriptLanguageServiceContent {
		throw new Error();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @param {string} _filePath
	 * @returns {number}
	 */
	public getFileVersion (_filePath: string): number {
		throw new Error();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @param {string} _filename
	 * @param {number} _position
	 * @returns {ImplementationLocation[]}
	 */
	public getImplementationAtPosition (_filename: string, _position: number): ImplementationLocation[] {
		throw new Error();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @param {Node} _statement
	 * @returns {ImplementationLocation[]}
	 */
	public getImplementationForStatement (_statement: Node): ImplementationLocation[] {
		throw new Error();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @param {string} _content
	 * @param {string} _from
	 * @returns {ITypescriptLanguageServiceImportPath[]}
	 */
	public getImportedFilesForContent (_content: string, _from: string): ITypescriptLanguageServiceImportPath[] {
		throw new Error();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @param {string} _filename
	 * @returns {ITypescriptLanguageServiceImportPath[]}
	 */
	public getImportedFilesForFile (_filename: string): ITypescriptLanguageServiceImportPath[] {
		throw new Error();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @param {Node} _statement
	 * @returns {ITypescriptLanguageServiceImportPath[]}
	 */
	public getImportedFilesForStatementFile (_statement: Node): ITypescriptLanguageServiceImportPath[] {
		throw new Error();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @param {(ITypescriptLanguageServiceGetPathInfoOptions & {content?: string}) | (ITypescriptLanguageServiceAddPath & {content?: string})} _options
	 * @returns {ITypescriptLanguageServicePathInfo}
	 */
	public getPathInfo (_options: (ITypescriptLanguageServiceGetPathInfoOptions&{ content?: string })|(ITypescriptLanguageServiceAddPath&{ content?: string })): ITypescriptLanguageServicePathInfo {
		throw new Error();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @param {string} _filename
	 * @param {number} _position
	 * @returns {QuickInfo}
	 */
	public getQuickInfoAtPosition (_filename: string, _position: number): QuickInfo {
		throw new Error();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @param {Node} _statement
	 * @returns {QuickInfo}
	 */
	public getQuickInfoForStatement (_statement: Node): QuickInfo {
		throw new Error();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @returns {string[]}
	 */
	public getScriptFileNames (): string[] {
		throw new Error();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @param {string} _fileName
	 * @returns {IScriptSnapshot | undefined}
	 */
	public getScriptSnapshot (_fileName: string): IScriptSnapshot|undefined {
		throw new Error();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @param {string} _fileName
	 * @returns {string}
	 */
	public getScriptVersion (_fileName: string): string {
		throw new Error();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @param {string} _filename
	 * @param {number} _position
	 * @returns {DefinitionInfo[]}
	 */
	public getTypeDefinitionAtPosition (_filename: string, _position: number): DefinitionInfo[] {
		throw new Error();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @param {Node} _statement
	 * @returns {DefinitionInfo[]}
	 */
	public getTypeDefinitionAtStatement (_statement: Node): DefinitionInfo[] {
		throw new Error();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @param {string} _fileName
	 */
	public removeFile (_fileName: string): void {
		throw new Error();
	}

	/**
	 * This is a noop. The constructor returns the proper implementation of TypescriptLanguageService
	 * @param {Partial<ITypescriptLanguageServiceOptions>} _options
	 */
	public setOptions (_options?: Partial<ITypescriptLanguageServiceOptions>): void {
		throw new Error();
	}
}