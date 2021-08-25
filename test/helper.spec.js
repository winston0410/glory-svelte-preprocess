import { getDeclaration, getClassName } from "../src/helper.js";
import { parse } from "svelte/compiler";
import { walk } from "svelte/compiler";
import { reset } from "../src/index.js"

afterEach(() => {
    reset()
})

//  getDeclaration
describe("when given a declaration with url() as value", () => {
  const code = `<style>
  .my-long-class-name{
    blackground:url(./background.jpg);
  }
</style>`;

  const ast = parse(code, { filename: "" });

  it("should parse it correctly", function () {
    walk(ast.css, {
      enter(node) {
        if (node.type !== "Declaration") {
          return;
        }
        expect(getDeclaration(node)).toBe("blackground:url(./background.jpg);");
      },
    });
  });
});

describe("when given a declaration with Hex code as value", function () {
  const code = `<style>
  .my-long-class-name{
    color:#ffffff;
  }
</style>`;

  const ast = parse(code, { filename: "" });

  it("should parse it correctly", function () {
    walk(ast.css, {
      enter(node) {
        if (node.type !== "Declaration") {
          return;
        }
        expect(getDeclaration(node)).toBe("color:#ffffff;");
      },
    });
  });
});

describe("when given a declaration with multiple numbers as value", function () {
  const code = `<style>
  .my-long-class-name{
    margin:0px 5px 10px 15px;
  }
</style>`;

  const ast = parse(code, { filename: "" });

  it("should parse it correctly", function () {
    walk(ast.css, {
      enter(node) {
        if (node.type !== "Declaration") {
          return;
        }
        expect(getDeclaration(node)).toBe("margin:0px 5px 10px 15px;");
      },
    });
  });
});

describe("when given a declaration that uses rgb() as its value", function () {
  const code = `<style>
  .my-long-class-name{
    box-shadow:0 0 2px 0 rgb(47 52 61 / 8%);
  }
</style>`;

  const ast = parse(code, { filename: "" });

  it("should parse it correctly", function () {
    walk(ast.css, {
      enter(node) {
        if (node.type !== "Declaration") {
          return;
        }
        expect(getDeclaration(node)).toBe(
          "box-shadow:0 0 2px 0 rgb(47 52 61 / 8%);"
        );
      },
    });
  });
});

describe("when given a declaration that uses var() as its value", function () {
  const code = `<style>
  .my-long-class-name{
    color:var(--highlight);
  }
</style>`;

  const ast = parse(code, { filename: "" });

  it("should parse it correctly", function () {
    walk(ast.css, {
      enter(node) {
        if (node.type !== "Declaration") {
          return;
        }
        expect(getDeclaration(node)).toBe("color:var(--highlight);");
      },
    });
  });
});

describe("when given a declaration that uses string as its value", function () {
  const code = `<style>
  .test::before{
    content:"hello";
  }
</style>`;

  const ast = parse(code, { filename: "" });

  it("should parse it correctly", function () {
    walk(ast.css, {
      enter(node) {
        if (node.type !== "Declaration") {
          return;
        }
        expect(getDeclaration(node)).toBe('content:"hello";');
      },
    });
  });
});

describe("when given a rule that uses child combinator in selector", function () {
  const code = `<style>
  .hello>.world{
    font-size: 20px;
  }
</style>`;

  const ast = parse(code, { filename: "" });

  it("should generate the selector correctly", function () {
    walk(ast.css, {
      enter(node) {
        if (node.type !== "Rule") {
          return;
        }
        const [selector] = getClassName(node)
        expect(selector).toBe(".hello>.world")
      },
    });
  });
});
