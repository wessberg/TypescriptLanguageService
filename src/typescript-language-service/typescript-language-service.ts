import {CompilerOptions, createDocumentRegistry, createLanguageService, DefinitionInfo, Expression, getDefaultLibFilePath, ImplementationLocation, IScriptSnapshot, LanguageService, ModuleKind, Node, preProcessFile, ReferencedSymbol, ScriptSnapshot, ScriptTarget, Statement} from "typescript";
import {ITypescriptLanguageService} from "./i-typescript-language-service";
import {IModuleUtil} from "@wessberg/moduleutil";
import {IFileLoader} from "@wessberg/fileloader";
import {ITypescriptLanguageServiceAddFileOptions} from "./i-typescript-language-service-add-file-options";
import {ITypescriptLanguageServiceGetFileOptions} from "./i-typescript-language-service-get-file-options";
import {IPathUtil} from "@wessberg/pathutil";

/**
 * A host-implementation of Typescripts LanguageService.
 * @author Frederik Wessberg
 */
export class TypescriptLanguageService implements ITypescriptLanguageService {

	/**
	 * A Map between filenames and their current version and content in the AST.
	 * @type {Map<string, {version: number, content: string}>}
	 */
	private files: Map<string, { version: number; content: string }> = new Map();

	/**
	 * The (Typescript) TypescriptLanguageService to use under-the-hood.
	 * @type {LanguageService}
	 */
	private languageService: LanguageService = createLanguageService(this, createDocumentRegistry());

	constructor (private moduleUtil: IModuleUtil,
							 private pathUtil: IPathUtil,
							 private fileLoader: IFileLoader) {
	}

	/**
	 * Adds a new file to the TypescriptLanguageService.
	 * @param {string} path
	 * @param {string} from
	 * @param {string} [content]
	 * @param {number} [version]
	 * @param {boolean} [addImportedFiles]
	 * @returns {Statement[]}
	 */
	public addFile ({path, from = process.cwd(), content, addImportedFiles}: ITypescriptLanguageServiceAddFileOptions): Statement[] {
		try {
			// Resolve the absolute, fully qualified path
			const resolvedPath = this.moduleUtil.resolvePath(path, from);
			const normalizedPath = this.normalizeExtension(resolvedPath);

			// Load the contents from the absolute path unless content was given as an argument
			const actualContent = content == null ? this.fileLoader.loadSync(resolvedPath).toString() : content;

			// Only actually update the file if it has changed.
			if (this.needsUpdate(resolvedPath, actualContent)) {
				// Bump the script version
				const actualVersion = this.getFileVersion(resolvedPath) + 1;

				// Store it as a parsed file
				this.files.set(normalizedPath, {version: actualVersion, content: actualContent});

				// Recursively add all missing imports to the LanguageService if 'addImportedFiles' is truthy.
				if (addImportedFiles != null && addImportedFiles) this.getImportedFilesForFile(resolvedPath).forEach(importedFile => this.addFile({path: importedFile, from: resolvedPath, addImportedFiles}));
			}

			// Retrieve the Statements of the file
			return this.getFile({path: resolvedPath, from});
		} catch (ex) {
			// A module attempted to load a file or a module which doesn't exist. Return an empty array.
			return [];
		}
	}

	/**
	 * Gets the Statements associated with the given filename.
	 * @param {string} path
	 * @param {string} [from]
	 * @returns {Statement[]}
	 */
	public getFile ({path, from = process.cwd()}: ITypescriptLanguageServiceGetFileOptions): Statement[] {
		// Resolve the absolute, fully qualified path
		const file = this.languageService.getProgram().getSourceFile(this.resolveAndNormalize(path, from));
		if (file == null) return [];
		return file == null ? [] : file.statements;
	}

	/**
	 * Removes a file from the TypescriptLanguageService.
	 * @param {string} fileName
	 * @returns {void}
	 */
	public removeFile (fileName: string): void {
		this.files.delete(fileName);
	}

	/**
	 * Gets the settings that Typescript will generate an AST from. There isn't much reason to make
	 * anything but the libs developer-facing since we only support ES2015 (and newer) modules.
	 * @returns {CompilerOptions}
	 */
	public getCompilationSettings (): CompilerOptions {
		return {
			target: ScriptTarget.ES2017,
			module: ModuleKind.ESNext,
			lib: ["es2015.promise", "dom", "es6", "scripthost", "es7", "es2017.object", "es2015.proxy"]
		};
	}

	/**
	 * Gets the names of each file that has been added to the "program".
	 * @returns {string[]}
	 */
	public getScriptFileNames (): string[] {
		return [...this.files.keys()];
	}

	/**
	 * Gets the last version of the given fileName. Each time a file changes, the version number will be updated,
	 * so this can be useful to figure out if the file has changed since the program was run initially.
	 * @param {string} fileName
	 * @returns {string}
	 */
	public getScriptVersion (fileName: string): string {
		const script = this.files.get(fileName);
		if (script == null) return "-1";
		return script.version.toString();
	}

	/**
	 * Gets the current version of the given filepath in the Typescript AST.
	 * @param {string} filePath
	 * @returns {number}
	 */
	public getFileVersion (filePath: string): number {
		const version = this.getScriptVersion(this.resolveAndNormalize(filePath));
		return parseInt(version);
	}

	/**
	 * Gets the last contents of the given filename.
	 * @param {string} fileName
	 * @returns {string}
	 */
	public getFileContent (fileName: string): string {
		const script = this.files.get(this.resolveAndNormalize(fileName));
		if (script == null) return "";
		return script.content.toString();
	}

	/**
	 * Gets the last registered IScriptSnapshot, if any, otherwise undefined.
	 * @param {string} fileName
	 * @returns {IScriptSnapshot?}
	 */
	public getScriptSnapshot (fileName: string): IScriptSnapshot|undefined {
		const file = this.files.get(this.resolveAndNormalize(fileName));
		if (file == null) return undefined;
		return ScriptSnapshot.fromString(file.content);
	}

	/**
	 * Gets the current directory.
	 * @returns {string}
	 */
	public getCurrentDirectory (): string {
		return process.cwd();
	}

	/**
	 * Gets the default filepath for Typescript's lib-files.
	 * @param {CompilerOptions} options
	 * @returns {string}
	 */
	public getDefaultLibFileName (options: CompilerOptions): string {
		return getDefaultLibFilePath(options);
	}

	/**
	 * Gets the DefinitionInfo at the provided position in the given file
	 * @param {string} filename
	 * @param {number} position
	 * @returns {DefinitionInfo[]}
	 */
	public getDefinitionAtPosition (filename: string, position: number): DefinitionInfo[] {
		const actualFilePath = this.resolveAndNormalize(filename);
		return this.languageService.getDefinitionAtPosition(actualFilePath, position);
	}

	/**
	 * Gets the DefinitionInfo for the provided Statement
	 * @param {Statement | Expression | Node} statement
	 * @returns {DefinitionInfo[]}
	 */
	public getDefinitionAtStatement (statement: Statement|Expression|Node): DefinitionInfo[] {
		const filePath = statement.getSourceFile().fileName;
		const position = statement.pos;
		return this.languageService.getDefinitionAtPosition(filePath, position);
	}

	/**
	 * Gets the Type DefinitionInfo at the provided position in the given file
	 * @param {string} filename
	 * @param {number} position
	 * @returns {DefinitionInfo[]}
	 */
	public getTypeDefinitionAtPosition (filename: string, position: number): DefinitionInfo[] {
		const actualFilePath = this.resolveAndNormalize(filename);
		return this.languageService.getTypeDefinitionAtPosition(actualFilePath, position);
	}

	/**
	 * Gets the Type DefinitionInfo at the position of the provided Statement.
	 * @param {Statement | Expression | Node} statement
	 * @returns {DefinitionInfo[]}
	 */
	public getTypeDefinitionAtStatement (statement: Statement|Expression|Node): DefinitionInfo[] {
		const filePath = statement.getSourceFile().fileName;
		const position = statement.pos;
		return this.languageService.getTypeDefinitionAtPosition(filePath, position);
	}

	/**
	 * Finds all references for the identifier on the provided position in the provided file
	 * @param {string} filename
	 * @param {number} position
	 * @returns {ReferencedSymbol[]}
	 */
	public findReferencesForPosition (filename: string, position: number): ReferencedSymbol[] {
		const actualFilePath = this.resolveAndNormalize(filename);
		return this.languageService.findReferences(actualFilePath, position);
	}

	/**
	 * Finds all references for the identifier associated with the provided Statement.
	 * @param {Statement | Expression | Node} statement
	 * @returns {ReferencedSymbol[]}
	 */
	public findReferencesForStatement (statement: Statement|Expression|Node): ReferencedSymbol[] {
		const filePath = statement.getSourceFile().fileName;
		const position = statement.pos;
		return this.languageService.findReferences(filePath, position);
	}

	/**
	 * Gets the implementation for the interface located on the given position in the given file
	 * @param {string} filename
	 * @param {number} position
	 * @returns {ImplementationLocation[]}
	 */
	public getImplementationAtPosition (filename: string, position: number): ImplementationLocation[] {
		const actualFilePath = this.resolveAndNormalize(filename);
		return this.languageService.getImplementationAtPosition(actualFilePath, position);
	}

	/**
	 * Gets the implementation for the interface associated with the given Statement,
	 * @param {Statement | Expression | Node} statement
	 * @returns {ImplementationLocation[]}
	 */
	public getImplementationForStatement (statement: Statement|Expression|Node): ImplementationLocation[] {
		const filePath = statement.getSourceFile().fileName;
		const position = statement.pos;
		return this.languageService.getImplementationAtPosition(filePath, position);
	}

	/**
	 * Gets all imported files for the given file
	 * @param {string} filename
	 * @returns {string[]}
	 */
	public getImportedFilesForFile (filename: string): string[] {
		const content = this.getFileContent(filename);
		return this.getImportedFilesForContent(content, filename);
	}

	/**
	 * Gets all imported files for the file that has the provided Statement.
	 * @param {Statement | Expression | Node} statement
	 * @returns {string[]}
	 */
	public getImportedFilesForStatementFile (statement: Statement|Expression|Node): string[] {
		return this.getImportedFilesForFile(statement.getSourceFile().fileName);
	}

	/**
	 * Gets all imported files for the given content
	 * @param {string} content
	 * @param {string} from
	 * @returns {string[]}
	 */
	public getImportedFilesForContent (content: string, from: string): string[] {
		return preProcessFile(content, true, true).importedFiles
		// Take file names
			.map(importedFile => this.resolvePath(importedFile.fileName, from))
			// Remove all native built-in modules.
			.filter(path => !this.moduleUtil.builtInModules.has(path));
	}

	/**
	 * Returns true if the provided file needs to be updated. Essentially, this comes down to whether or not the content has changed.
	 * @param {string} filePath
	 * @param {string} content
	 * @returns {boolean}
	 */
	private needsUpdate (filePath: string, content: string): boolean {
		const oldContent = this.getFileContent(filePath);
		return !(content === oldContent);
	}

	/**
	 * Makes sure that the provided filePath ends with ".ts", unless it is already an absolute path
	 * @param {string} filePath
	 * @returns {string}
	 */
	private normalizeExtension (filePath: string): string {
		return this.pathUtil.setExtension(filePath, ".ts");
	}

	/**
	 * Resolves the path to a module
	 * @param {string} filePath
	 * @param {string} [from]
	 * @returns {string}
	 */
	private resolvePath (filePath: string, from?: string): string {
		return filePath.endsWith(".ts") || filePath.endsWith(".tsx") ? filePath : this.moduleUtil.resolvePath(filePath, from);
	}

	/**
	 * Resolves the path to a module and sets a '.ts' extension on it.
	 * @param {string} filePath
	 * @param {string} from
	 * @returns {string}
	 */
	private resolveAndNormalize (filePath: string, from?: string): string {
		return this.normalizeExtension(this.resolvePath(filePath, from));
	}
}