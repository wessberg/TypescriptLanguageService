import {CompilerOptions, createDocumentRegistry, createLanguageService, createNodeArray, DefinitionInfo, Expression, getDefaultLibFilePath, ImplementationLocation, IScriptSnapshot, LanguageService, ModuleKind, Node, NodeArray, preProcessFile, ReferencedSymbol, ScriptSnapshot, ScriptTarget, Statement} from "typescript";
import {ITypescriptLanguageService} from "./i-typescript-language-service";
import {IModuleUtil} from "@wessberg/moduleutil";
import {IFileLoader} from "@wessberg/fileloader";
import {ITypescriptLanguageServiceAddFileOptions} from "./i-typescript-language-service-add-file-options";
import {ITypescriptLanguageServiceGetFileOptions} from "./i-typescript-language-service-get-file-options";
import {IPathUtil} from "@wessberg/pathutil";
import {ITypescriptLanguageServiceOptions} from "./i-typescript-language-service-options";
import {ITypescriptPackageReassembler} from "@wessberg/typescript-package-reassembler";
import {ITypescriptLanguageServiceFile} from "./i-typescript-language-service-file";
import {ITypescriptLanguageServiceContent} from "./i-typescript-language-service-content";
import {ITypescriptLanguageServiceAddPath} from "./i-typescript-language-service-add-path";
import {ITypescriptLanguageServicePathInfo} from "./i-typescript-language-service-path-info";

/**
 * A host-implementation of Typescripts LanguageService.
 * @author Frederik Wessberg
 */
export class TypescriptLanguageService implements ITypescriptLanguageService {
	/**
	 * A suffix to temporarily append to .d.ts files
	 * @type {string}
	 */
	private static readonly DECLARATION_TEMPORARY_SUFFIX = "-temp";

	/**
	 * A Map between paths and their resolved paths
	 * @type {Map<string, ITypescriptLanguageServiceAddPath>}
	 */
	private static readonly RESOLVED_PATH_MAP: Map<string, ITypescriptLanguageServiceAddPath> = new Map();
	/**
	 * The Set of all Regular Expressions for matching files to be excluded
	 * @type {Set<RegExp>}
	 */
	private excludedFiles: Set<RegExp> = new Set();
	/**
	 * A Map between filenames and their current version and content in the AST.
	 * @type {Map<string, ITypescriptLanguageServiceFile>}
	 */
	private files: Map<string, ITypescriptLanguageServiceFile> = new Map();
	/**
	 * The (Typescript) TypescriptLanguageService to use under-the-hood.
	 * @type {LanguageService}
	 */
	private languageService: LanguageService = createLanguageService(this, createDocumentRegistry());

	constructor (private moduleUtil: IModuleUtil,
							 private pathUtil: IPathUtil,
							 private fileLoader: IFileLoader,
							 private reassembler: ITypescriptPackageReassembler,
							 options?: Partial<ITypescriptLanguageServiceOptions>) {
		if (options != null && options.excludedFiles != null) {
			this.excludeFiles(options.excludedFiles);
		}
	}

	/**
	 * Returns the part that will be added to any temporary declaration file
	 * @returns {string}
	 */
	private get temporaryDeclarationAddition (): string {
		return `${TypescriptLanguageService.DECLARATION_TEMPORARY_SUFFIX}.ts`;
	}

	/**
	 * Excludes files from the compiler that matches the provided Regular Expression(s)
	 * @param {RegExp | Iterable<RegExp>} match
	 */
	public excludeFiles (match: RegExp|Iterable<RegExp>): void {
		if (match instanceof RegExp) this.excludedFiles.add(match);
		else [...match].forEach(regExpItem => this.excludedFiles.add(regExpItem));
	}

	/**
	 * Gets relevant path info
	 * @param {string} path
	 * @param {string} from
	 * @param {string} content
	 * @returns {ITypescriptLanguageServicePathInfo}
	 */
	public getPathInfo (path: string, from = process.cwd(), content?: string): ITypescriptLanguageServicePathInfo {
		const {isTemporary, resolvedPath, normalizedPath} = this.getAddPath(path, from);

		// Load the contents from the absolute path unless content was given as an argument
		let actualContent = content == null ? this.fileLoader.loadSync(isTemporary ? this.clearTemporaryDeclarationAddition(resolvedPath) : resolvedPath).toString() : content;
		// Make a copy of the actual content
		const rawContent = actualContent;

		// Check if the file needs an update
		const needsUpdate = this.needsUpdate(normalizedPath, actualContent);

		if (needsUpdate) {
			// Check if it was actually .js file before normalizing the extension (in which case we want to merge declarations in)
			if (resolvedPath.endsWith(".js")) {

				// Check for a matching declaration file
				const [exists, declarationPath] = this.fileLoader.existsWithFirstMatchedExtensionSync(this.pathUtil.clearExtension(resolvedPath), [".d.ts"]);
				if (exists) {
					// Merge/Reassemble the declarations with the .js file
					actualContent = this.reassemble(normalizedPath, actualContent, declarationPath!);
				}
			}
		}

		return {
			isTemporary,
			resolvedPath,
			normalizedPath,
			rawContent: rawContent,
			content: actualContent,
			needsUpdate
		};
	}

	/**
	 * Gets info about the path that will be added to Typescript's AST
	 * @param {string} path
	 * @param {string} from
	 * @returns {ITypescriptLanguageServiceAddPath}
	 */
	public getAddPath (path: string, from = process.cwd()): ITypescriptLanguageServiceAddPath {
		// Check first if the path has been resolved previously
		const key = `${path}_${from}`;
		const existing = TypescriptLanguageService.RESOLVED_PATH_MAP.get(key);
		// Return the cached path
		if (existing != null) {
			return existing;
		}

		// Otherwise, resolve the path
		const isTemporary = path.endsWith(this.temporaryDeclarationAddition);
		const resolvedPath = isTemporary ? path : this.moduleUtil.resolvePath(path, from);
		const normalizedPath = isTemporary ? path : this.normalizeExtension(resolvedPath);

		// Create the path dict
		const addPath: ITypescriptLanguageServiceAddPath = {
			resolvedPath,
			normalizedPath,
			isTemporary
		};

		// Cache it
		TypescriptLanguageService.RESOLVED_PATH_MAP.set(key, addPath);

		// Return it
		return addPath;
	}

	/**
	 * Adds a new file to the TypescriptLanguageService.
	 * @param {string} path
	 * @param {string} from
	 * @param {string} [content]
	 * @param {number} [version]
	 * @param {boolean} [addImportedFiles]
	 * @param {ITypescriptLanguageServicePathInfo} [pathInfo]
	 * @returns {NodeArray<Statement>}
	 */
	public addFile ({path, from = process.cwd(), content, addImportedFiles, pathInfo}: ITypescriptLanguageServiceAddFileOptions): NodeArray<Statement> {
		const {resolvedPath, normalizedPath, needsUpdate, rawContent, content: actualContent} = pathInfo == null ? this.getPathInfo(path, from, content) : pathInfo;

		// Only actually update the file if it has changed.
		if (needsUpdate) {

			// Bump the script version
			const actualVersion = this.getFileVersion(resolvedPath) + 1;

			// Store it as a parsed file
			this.files.set(normalizedPath, {version: actualVersion, content: actualContent, rawContent});

			// Recursively add all missing imports to the LanguageService if 'addImportedFiles' is truthy.
			if (addImportedFiles != null && addImportedFiles) this.getImportedFilesForFile(resolvedPath).forEach(importedFile => {
				if (!this.isExcluded(importedFile)) this.addFile({path: importedFile, from: resolvedPath, addImportedFiles});
			});
		}

		// Retrieve the Statements of the file
		return this.getFile({path, from});
	}

	/**
	 * Gets the Statements associated with the given filename.
	 * @param {string} path
	 * @param {string} [from]
	 * @returns {NodeArray<Statement>}
	 */
	public getFile ({path, from = process.cwd()}: ITypescriptLanguageServiceGetFileOptions): NodeArray<Statement> {
		// Resolve the absolute, fully qualified path
		const {normalizedPath} = this.getAddPath(path, from);
		const file = this.languageService.getProgram().getSourceFile(normalizedPath);
		if (file == null) return createNodeArray();
		return file == null ? createNodeArray() : file.statements;
	}

	/**
	 * Removes a file from the TypescriptLanguageService.
	 * @param {string} fileName
	 * @returns {void}
	 */
	public removeFile (fileName: string): void {
		// Typescript itself invokes this method with virtual files that can't be resolved. We need to accept that
		const normalizedPath = fileName.endsWith(".ts") || fileName.endsWith(".tsx") ? fileName : this.getAddPath(fileName).normalizedPath;
		this.files.delete(normalizedPath);
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
		// Typescript itself invokes this method with virtual files that can't be resolved. We need to accept that
		const normalizedPath = fileName.endsWith(".ts") || fileName.endsWith(".tsx") ? fileName : this.getAddPath(fileName).normalizedPath;

		const script = this.files.get(normalizedPath);
		if (script == null) return "-1";
		return script.version.toString();
	}

	/**
	 * Gets the current version of the given filepath in the Typescript AST.
	 * @param {string} filePath
	 * @returns {number}
	 */
	public getFileVersion (filePath: string): number {
		const version = this.getScriptVersion(filePath);
		return parseInt(version);
	}

	/**
	 * Gets the last contents of the given filename.
	 * @param {string} fileName
	 * @returns {ITypescriptLanguageServiceContent}
	 */
	public getFileContent (fileName: string): ITypescriptLanguageServiceContent {
		const {normalizedPath} = this.getAddPath(fileName);
		const script = this.files.get(normalizedPath);
		if (script == null) return {content: "", rawContent: ""};
		return {content: script.content, rawContent: script.rawContent};
	}

	/**
	 * Gets the last registered IScriptSnapshot, if any, otherwise undefined.
	 * @param {string} fileName
	 * @returns {IScriptSnapshot?}
	 */
	public getScriptSnapshot (fileName: string): IScriptSnapshot|undefined {
		// Typescript itself invokes this method with virtual files that can't be resolved. We need to accept that
		const normalizedPath = fileName.endsWith(".ts") || fileName.endsWith(".tsx") ? fileName : this.getAddPath(fileName).normalizedPath;
		const file = this.files.get(normalizedPath);
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
		const {normalizedPath} = this.getAddPath(filename);
		return this.languageService.getDefinitionAtPosition(normalizedPath, position);
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
		const {normalizedPath} = this.getAddPath(filename);
		return this.languageService.getTypeDefinitionAtPosition(normalizedPath, position);
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
		const {normalizedPath} = this.getAddPath(filename);
		return this.languageService.findReferences(normalizedPath, position);
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
		const {normalizedPath} = this.getAddPath(filename);
		return this.languageService.getImplementationAtPosition(normalizedPath, position);
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
		const {content} = this.getFileContent(filename);
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
			// Remove all native built-in modules and non-existing files.
			.filter(file => file.fileName != null && file.fileName.length > 0 && !this.moduleUtil.builtInModules.has(file.fileName))
			// Take file names.
			.map(importedFile => this.getAddPath(importedFile.fileName, from).normalizedPath);
	}

	/**
	 * Returns true if the given filepath should be excluded
	 * @param {string} filepath
	 * @returns {boolean}
	 */
	private isExcluded (filepath: string): boolean {
		return [...this.excludedFiles].some(regex => regex.test(filepath));
	}

	/**
	 * Reassembles a compiled .js file (though normalized with a .ts extension) with a matching declaration file (.d.ts)
	 * to re-add "lost" type information after publishing to NPM.
	 * @param {string} normalizedPath
	 * @param {string} normalizedContent
	 * @param {string} declarationPath
	 * @returns {string}
	 */
	private reassemble (normalizedPath: string, normalizedContent: string, declarationPath: string): string {
		// Add a suffix to the declaration file so it won't override the other one
		const normalizedDeclarationPath = declarationPath.slice(0, declarationPath.lastIndexOf(".d.ts")) + this.temporaryDeclarationAddition;
		// Temporarily add the files
		this.files.set(normalizedPath, {version: 0, content: normalizedContent, rawContent: normalizedContent});
		this.addFile({path: normalizedDeclarationPath});
		const compiledStatements = this.getFile({path: normalizedPath});
		const declarationStatements = this.getFile({path: normalizedDeclarationPath});
		// Remove the files now
		this.removeFile(normalizedPath);
		this.removeFile(normalizedDeclarationPath);

		const {content} = this.reassembler.reassemble({compiledStatements, declarationStatements});
		return content;
	}

	/**
	 * Clears the part of a path that has been added as a temporary declaration
	 * @param {string} path
	 * @returns {string}
	 */
	private clearTemporaryDeclarationAddition (path: string): string {
		return `${path.slice(0, path.lastIndexOf(this.temporaryDeclarationAddition))}.d.ts`;
	}

	/**
	 * Returns true if the provided file needs to be updated. Essentially, this comes down to whether or not the content has changed.
	 * @param {string} filePath
	 * @param {string} content
	 * @returns {boolean}
	 */
	private needsUpdate (filePath: string, content: string): boolean {
		const {rawContent} = this.getFileContent(filePath);
		return content !== rawContent;
	}

	/**
	 * Makes sure that the provided filePath ends with ".ts", unless it is already an absolute path
	 * @param {string} filePath
	 * @returns {string}
	 */
	private normalizeExtension (filePath: string): string {
		if (filePath.endsWith(".d.ts")) {
			// Make it appear as a proper Typescript file
			return filePath.slice(0, filePath.lastIndexOf(".d.ts")) + ".ts";
		}
		return this.pathUtil.setExtension(filePath, ".ts");
	}
}