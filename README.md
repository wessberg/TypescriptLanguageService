# TypescriptLanguageService

> A host-implementation of Typescripts LanguageService.

## Installation
Simply do: `npm install @wessberg/typescript-language-service`.

## What is it

This is an implementation of Typescript's LanguageService. It can resolve *.ts* and *.js* files and builds up an AST from both kinds of files.
It can recursively add all imports of a module to the AST if required. Otherwise it can be used to parse and generate Statements, Expressions and (Typescript) Nodes from source code.

## Usage
```typescript
const languageService = new TypescriptLanguageService(moduleUtil, pathUtil, fileLoader);
languageService.addFile({
	path: "foo.ts",
	content: `
		import {bar} from "./bar";
		export const foo = bar + 2;
	`,
	addImportedFiles: true
});
```

### Dependencies

TypescriptLanguageService is built to fit dependency injection systems. Thus, it requires three services to be constructor-injected: implementations of [IModuleUtil](https://github.com/wessberg/moduleutil), [IFileLoader](https://github.com/wessberg/fileloader) and [IPathUtil](https://github.com/wessberg/pathutil).
You can npm-install both of them: `npm install @wessberg/moduleutil`, `npm install @wessberg/fileloader` and `npm install @wessberg/pathutil` and either pass them on to the constructor or add them to your dependency injection system.