import {ITypescriptLanguageServicePathInfo} from "./i-typescript-language-service-path-info";

export interface ITypescriptLanguageServiceAddFileOptions {
	path: string;
	from?: string;
	content?: string;
	addImportedFiles?: boolean;
	pathInfo?: ITypescriptLanguageServicePathInfo;
}