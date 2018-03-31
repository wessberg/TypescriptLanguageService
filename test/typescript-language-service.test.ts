import "../src/services";

import {test} from "ava";
import {createSourceFile, ScriptTarget} from "typescript";
import {TypescriptLanguageService} from "../src/typescript-language-service/typescript-language-service";

const file = createSourceFile("foo.ts", `export * from "foo`, ScriptTarget.ES2017);
file.statements.forEach(statement => {
	console.log(statement);
});

const languageService = new TypescriptLanguageService();

test("foo", t => {
	languageService.addFile({path: "./test/static/foo", addImportedFiles: true});
	const res = languageService.getImportedFilesForFile("./test/static/foo");
	console.log(res);
	t.true(res != null);
});