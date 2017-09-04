import {ITypescriptLanguageServiceAddPath} from "./i-typescript-language-service-add-path";

export interface ITypescriptLanguageServicePathInfo extends ITypescriptLanguageServiceAddPath {
	needsUpdate: boolean;
	rawContent: string;
	content: string;
}