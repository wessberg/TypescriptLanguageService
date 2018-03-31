# TypescriptLanguageServiceHost
[![NPM version][npm-version-image]][npm-version-url]
[![License-mit][license-mit-image]][license-mit-url]

[license-mit-url]: https://opensource.org/licenses/MIT

[license-mit-image]: https://img.shields.io/badge/License-MIT-yellow.svg

[npm-version-url]: https://www.npmjs.com/package/@wessberg/typescript-language-service

[npm-version-image]: https://badge.fury.io/js/%40wessberg%2Ftypescript-language-service.svg

> A host-implementation of Typescripts LanguageService.

## Installation
Simply do: `npm install @wessberg/typescript-language-service`.

## What is it

This is an implementation of Typescript's LanguageService. It can resolve *.ts* and *.js* files and builds up an AST from both kinds of files.
It can recursively add all imports of a module to the AST if required. Otherwise it can be used to parse and generate Statements, Expressions and (Typescript) Nodes from source code.

Additionally, if a file is added (either directly or automatically) that has a definition file (`.d.ts`) with the same name in the same directory, it will merge the two before adding the file to the LanguageService.

## Usage
```typescript
const languageService = new TypescriptLanguageServiceHost();
languageService.addFile({
	path: "foo.ts",
	content: `
		import {bar} from "./bar";
		export const foo = bar + 2;
	`,
	addImportedFiles: true
});
```