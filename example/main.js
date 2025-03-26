import { Tailor } from "./dist/index.js";

const tailor = new Tailor({ functionsUrl: "/functions.js" });

const { id, result } = tailor.schedule("add", { args: [5, 5] });

console.log({ id, result });

result.then((result) => console.log({ result }));
