import {ITypescriptLanguageServicePathInfo} from "./i-typescript-language-service-path-info";
import {ITypescriptLanguageServiceAddFileOptions} from "./i-typescript-language-service-add-file-options";

/**
 * Returns true if the given item is an ITypescriptLanguageServicePathInfo
 * @param {ITypescriptLanguageServicePathInfo | ITypescriptLanguageServiceAddFileOptions} item
 * @returns {boolean}
 */
export function isTypescriptLanguageServicePathInfo (item: ITypescriptLanguageServicePathInfo|ITypescriptLanguageServiceAddFileOptions): item is ITypescriptLanguageServicePathInfo {
	return item != null && "needsUpdate" in item && "rawContent" in item && "content" in item && "normalizedPath" in item && "resolvedPath" in item && "isTemporary" in item;
}