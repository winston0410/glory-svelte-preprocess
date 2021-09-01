import createTokenizer from "../src/tokenizer";
import { getProxiedObject } from "../src/helper";
import { parse } from "svelte/compiler";
import path from "path";
import wrappedPreprocessor from "./wrapper.js";
import { reset } from "../src/index.js"

afterEach(() => {
    reset()
})

describe("when given a class with mustacheTag", function () {
  it("should transform the class correctly", function () {
    const code = `
<style>
.hello{
color: #ff3e00;
}
</style><h1 class={\`hello\`}></h1>`;

    const filename = "/src/routes/index.svelte";

    const result = wrappedPreprocessor(code, filename).code;

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
    :global(.a){
    color: #ff3e00;
    }
    </style>
    <h1 class={\`a\`}></h1>
`.replace(/\s/g, "")
    );
  });
});
