import {CompilerOptions} from "typescript";

export interface ITypescriptLanguageServiceOptions {
	excludedFiles: RegExp|Iterable<RegExp>;
	compilerOptions: CompilerOptions;
}