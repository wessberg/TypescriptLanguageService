import "../src/services";

import {test} from "ava";
import {TypescriptLanguageService} from "../src/typescript-language-service/typescript-language-service";

const languageService = new TypescriptLanguageService();

test("foo", t => {
	languageService.addFile({path: "./test/static/foo", addImportedFiles: true});
	const res = languageService.getImportedFilesForFile("./test/static/foo");
	t.true(res != null);
});