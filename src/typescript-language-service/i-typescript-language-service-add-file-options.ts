export interface ITypescriptLanguageServiceAddFileOptions {
	path: string;
	from?: string;
	content?: string;
	addImportedFiles?: boolean;
}