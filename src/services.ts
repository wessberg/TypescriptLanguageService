import {DIContainer} from "@wessberg/di";
import {FileLoader, IFileLoader} from "@wessberg/fileloader";
import {IPathUtil, PathUtil} from "@wessberg/pathutil";
import {IModuleUtil, ModuleUtil} from "@wessberg/moduleutil";
import {ITypescriptPackageReassembler, TypescriptPackageReassembler} from "@wessberg/typescript-package-reassembler";
import {ITypescriptLanguageServiceHost} from "./typescript-language-service/i-typescript-language-service-host";
import {TypescriptLanguageServiceHost} from "./typescript-language-service/typescript-language-service-host";

DIContainer.registerSingleton<IFileLoader, FileLoader>();
DIContainer.registerSingleton<IPathUtil, PathUtil>();
DIContainer.registerSingleton<IModuleUtil, ModuleUtil>();
DIContainer.registerSingleton<ITypescriptPackageReassembler, TypescriptPackageReassembler>();
DIContainer.registerSingleton<ITypescriptLanguageServiceHost, TypescriptLanguageServiceHost>();