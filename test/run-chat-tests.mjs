import {execFileSync} from "node:child_process";
import {mkdtempSync, rmSync, readFileSync, writeFileSync, mkdirSync} from "node:fs";
import {tmpdir} from "node:os";
import {dirname, join, resolve, relative, sep} from "node:path";
import {fileURLToPath} from "node:url";
import {createRequire} from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const temporary = mkdtempSync(join(tmpdir(), "lotusbuild-chat-tests-"));
const files = ["test/workspace-chat.test.ts", "test/chat-markdown.test.ts", "test/workspace-interaction.test.ts"];
const compiled = new Set();
function compile(file) {
  if (compiled.has(file)) return;
  if (!file.startsWith(root + sep)) throw new Error("Test source outside workspace");
  compiled.add(file);
  const source = readFileSync(file, "utf8");
  const output = join(temporary, relative(root, file).replace(/\.tsx?$/, ".js"));
  mkdirSync(dirname(output), {recursive: true});
  writeFileSync(output, ts.transpileModule(source, {fileName: file, compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  }}).outputText);
  for (const entry of ts.preProcessFile(source, true, true).importedFiles) {
    if (!entry.fileName.startsWith(".")) continue;
    if (entry.fileName.endsWith(".css")) {
      const styleStub = join(temporary, relative(root, resolve(dirname(file), entry.fileName)));
      mkdirSync(dirname(styleStub), {recursive: true});
      writeFileSync(styleStub, "module.exports = new Proxy({}, {get: (_, key) => String(key)});");
      continue;
    }
    const imported = resolve(dirname(file), entry.fileName.replace(/\.js$/, ""));
    let found;
    for (const extension of [".ts", ".tsx"]) {
      try { readFileSync(imported + extension); found = imported + extension; break; } catch (error) { if (error.code !== "ENOENT") throw error; }
    }
    if (!found) throw new Error(`Missing test dependency: ${entry.fileName}`);
    compile(found);
  }
}
try {
  execFileSync(process.execPath, [require.resolve("typescript/lib/tsc.js"), "--noEmit"], {cwd: root, stdio: "inherit"});
  files.forEach(file => compile(join(root, file)));
  execFileSync(process.execPath, ["--test", ...files.map(file => join(temporary, file.replace(/\.ts$/, ".js")))], {
    cwd: root, stdio: "inherit", env: {...process.env, NODE_PATH: join(root, "node_modules")},
  });
} finally {
  if (!resolve(temporary).startsWith(resolve(tmpdir()) + sep)) throw new Error("Unexpected test output directory");
  rmSync(temporary, {recursive: true, force: true});
}
