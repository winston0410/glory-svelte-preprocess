//  Black box testing here
import createTokenizer from "../src/tokenizer";
import { getProxiedObject } from "../src/helper";
import { parse } from "svelte/compiler";
import path from "path";
import wrappedPreprocessor from "./wrapper.js";

describe("when given a rule with descendant combinator", function () {
  const code = `
<style lang="scss">
.main .h1 {
  color: #ff3e00;
  text-transform: uppercase;
  font-size: 4em;
  font-weight: 100;
}
</style>`;
  const filename = "/src/routes/index.svelte";

  const classCache = getProxiedObject();
  const declarationCache = getProxiedObject();

  const tokenizer = createTokenizer(classCache, declarationCache);
  const ast = parse(code, { filename });
  const parsedPath = path.parse(filename);
  tokenizer.generateToken(ast.css, parsedPath);

  it("should generate the class cache correctly", function () {
    expect(classCache).toEqual(
      expect.objectContaining({
        "/src/routes": {
          "index.svelte": new Map([
            [
              {
                type: "Selector",
                children: [
                  {
                    type: "ClassSelector",
                    name: "main",
                    start: 20,
                    end: 25,
                  },
                  {
                    type: "WhiteSpace",
                    loc: null,
                    value: " ",
                  },
                  {
                    type: "ClassSelector",
                    name: "h1",
                    start: 26,
                    end: 29,
                  },
                ],
                start: 20,
                end: 29,
              },
              { a: true, b: true, c: true, d: true },
            ],
          ]),
        },
      })
    );
  });
});

describe("when given a rule with descendant combinator", function () {
  it("should add class to the right HTML tag", function () {
    const code = `
<style>
.main .h1{
  color: #ff3e00;
}
</style><main class="main"><h1 class="h1"></h1></main>`;

    const filename = "/src/routes/index.svelte";

    const result = wrappedPreprocessor(code, filename).code;

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
        :global(.a){
          color: #ff3e00;
        }
      </style>
      <main class="main">
          <h1 class="a"></h1>
      </main>
`.replace(/\s/g, "")
    );
  });
});

describe("when given a rule with child combinator", function () {
  it("should add class to its direct child", function () {
    const code = `
<style>
.main>.h1{
  color: #ff3e00;
}
</style><main class="main"><h1 class="h1"></h1></main>`;

    const filename = "/src/routes/index.svelte";

    const result = wrappedPreprocessor(code, filename).code;

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
        :global(.a){
          color: #ff3e00;
        }
      </style>
      <main class="main">
          <h1 class="a"></h1>
      </main>
`.replace(/\s/g, "")
    );
  });

  it("should not add class in other level", function () {
    const code = `
<style>
.main>.h1{
  color: #ff3e00;
}
</style><main class="main"><div><h1 class="h1"></h1></div></main>`;

    const filename = "/src/routes/index.svelte";

    const result = wrappedPreprocessor(code, filename).code;

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
        :global(.a){
          color: #ff3e00;
        }
      </style>
      <main class="main">
          <div>
          <h1 class="h1"></h1>
          </div>
      </main>
`.replace(/\s/g, "")
    );
  });
});

describe("when given a rule with id selector", function () {
  it("should add class to the right HTML tag", function () {
    const code = `
<style>
#hello{
color: #ff3e00;
}
</style><h1 id="hello"></h1>`;

    const filename = "/src/routes/index.svelte";

    const result = wrappedPreprocessor(code, filename).code;

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
    :global(.a){
    color: #ff3e00;
    }
    </style>
    <h1 id="hello" class="a"></h1>
`.replace(/\s/g, "")
    );
  });
});

describe("when given a rule with type selector", function () {
  it("should add class to the right HTML tag", function () {
    const code = `
<style>
h1{
color: #ff3e00;
}
</style><h1></h1>`;

    const filename = "/src/routes/index.svelte";

    const result = wrappedPreprocessor(code, filename).code;

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
    :global(.a){
    color: #ff3e00;
    }
    </style>
    <h1 class="a"></h1>
`.replace(/\s/g, "")
    );
  });
});

describe("when given a rule with pseudo class", function () {
  it("should add class to the correct tag", function () {
    const code = `
<style>
.hello:hover{
  color: #ff3e00;
}
</style><div><h1 class="hello"></h1></div>`;

    const filename = "/src/routes/index.svelte";

    const result = wrappedPreprocessor(code, filename).code;

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
        :global(.a:hover){
          color: #ff3e00;
        }
      </style>
      <div>
          <h1 class="a"></h1>
      </div>
`.replace(/\s/g, "")
    );
  });
});

describe("when given a rule with pseudo element", function () {
  it("should add class to the correct tag", function () {
    const code = `
<style>
.world::before{
  color: #ff3e00;
}
</style><div><h1 class="world"></h1></div>`;

    const filename = "/src/routes/index.svelte";

    const result = wrappedPreprocessor(code, filename).code;

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
        :global(.a::before){
          color: #ff3e00;
        }
      </style>
      <div>
          <h1 class="a"></h1>
      </div>
`.replace(/\s/g, "")
    );
  });
});

describe("when given a rule with :not pseudo selector", function () {
  it("should transform the html correctly", function () {
    const code = `
<style>
:not(.hello){
  color: #ff3e00;
}
</style><p></p><p class="world"></p>`;

    const filename = "/src/routes/index.svelte";

    const result = wrappedPreprocessor(code, filename).code;

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
        :global(.a){
          color: #ff3e00;
        }
      </style><p class="a"></p><p class="a"></p>
`.replace(/\s/g, "")
    );
  });
});
