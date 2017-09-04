import {test} from "ava";
import {TypescriptLanguageService} from "../src/typescript-language-service/typescript-language-service";
import {ModuleUtil} from "@wessberg/moduleutil";
import {FileLoader} from "@wessberg/fileloader";
import {PathUtil} from "@wessberg/pathutil";
import {TypescriptPackageReassembler} from "@wessberg/typescript-package-reassembler";

const fileLoader = new FileLoader();
const pathUtil = new PathUtil(fileLoader);
const moduleUtil = new ModuleUtil(fileLoader, pathUtil);
const reassembler = new TypescriptPackageReassembler();
const languageService = new TypescriptLanguageService(moduleUtil, pathUtil, fileLoader, reassembler);

test("foo", t => {
	languageService.addFile({path: "./test/static/foo", addImportedFiles: true});
	const res = languageService.getImportedFilesForFile("./test/static/foo");
	console.log(res);
	t.true(res != null);
});