import {ITypescriptLanguageServiceHost} from "./i-typescript-language-service-host";

export interface ITypescriptLanguageService extends ITypescriptLanguageServiceHost {
}

export interface ITypescriptLanguageServiceConstructor {
	new (): ITypescriptLanguageService;
}