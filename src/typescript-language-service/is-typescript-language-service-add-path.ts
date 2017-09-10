import {ITypescriptLanguageServiceGetPathInfoOptions} from "./i-typescript-language-service-get-path-info-options";
import {ITypescriptLanguageServiceAddPath} from "./i-typescript-language-service-add-path";

/**
 * Returns true if the given item is an ITypescriptLanguageServiceAddPath
 * @param {ITypescriptLanguageServiceGetPathInfoOptions | ITypescriptLanguageServiceAddPath} item
 * @returns {boolean}
 */
export function isTypescriptLanguageServiceAddPath (item: ITypescriptLanguageServiceGetPathInfoOptions|ITypescriptLanguageServiceAddPath): item is ITypescriptLanguageServiceAddPath {
	return item != null && "normalizedPath" in item && "resolvedPath" in item && "isTemporary" in item;
}