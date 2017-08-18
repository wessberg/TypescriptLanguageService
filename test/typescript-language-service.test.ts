import {test} from "ava";
import {TypescriptLanguageService} from "../src/typescript-language-service/typescript-language-service";
import {ModuleUtil} from "@wessberg/moduleutil";
import {FileLoader} from "@wessberg/fileloader";
import {PathUtil} from "@wessberg/pathutil";

const fileLoader = new FileLoader();
const pathUtil = new PathUtil(fileLoader);
const moduleUtil = new ModuleUtil(fileLoader, pathUtil);
const languageService = new TypescriptLanguageService(moduleUtil, pathUtil, fileLoader);

test("foo", t => {
	languageService.addFile({path: "./test/static/foo", addImportedFiles: true});
	t.true(true);
});