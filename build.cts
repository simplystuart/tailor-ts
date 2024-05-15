import * as ts from "typescript"
import { readFile } from "fs";

readFile("src/worker.ts", "utf8", (err, worker) => {
  if (err) throw err;

  let result = ts.transpileModule(worker, { compilerOptions: { module: ts.ModuleKind.ESNext } });

  console.log(JSON.stringify(result));
});
