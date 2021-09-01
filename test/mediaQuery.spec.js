import wrappedPreprocessor from "./wrapper.js";
import { reset } from "../src/index.js";

afterEach(() => {
  reset();
});

describe("when given a rule with media query", function () {
  it("should add class to the right HTML tag", function () {
    const code = `
<style>
@media (min-width: 768px){
    .hello{
        color: red;
    }
}
</style><h1 class="hello"></h1>`;

    const filename = "/src/routes/index.svelte";

    const result = wrappedPreprocessor(code, filename).code;

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
    @media(min-width: 768px){
        :global(.a){
            color: red;
        }
    }
    </style>
    <h1 class="a"></h1>
`.replace(/\s/g, "")
    );
  });
});

describe("when given a rule with media query", function () {
  describe("when given a rule of the same class", () => {
    it("should add class to the right HTML tag", function () {
      const code = `
<style>
.hello{
    color: blue;
}
@media (min-width: 768px){
    .hello{
        color: red;
    }
}
</style><h1 class="hello"></h1>`;

      const filename = "/src/routes/index.svelte";

      const result = wrappedPreprocessor(code, filename).code;

      expect(result.replace(/\s/g, "")).toBe(
        `<style>
    :global(.a){
          color: blue;
    }
    @media(min-width: 768px){
        :global(.b){
            color: red;
        }
    }
    </style>
    <h1 class="a b"></h1>
`.replace(/\s/g, "")
      );
    });
  });
});

//  describe("when given a rule with media query", function () {
  //  describe("when given a rule of the same class", () => {
    //  it("should add class to the right HTML tag", function () {
      //  const code = `
//  <style>
//  .title-heading{
    //  font-size: 58px;
    //  font-family: var(--display-font);
    //  font-weight: 700;
    //  color: var(--highlight);
//  }

//  @media (min-width: 768px){
  //  .title-heading{
      //  font-size: 90px;
  //  }
//  }
          
//  @media (min-width: 1200px){
  //  .title-heading{
      //  font-size: 120px;
  //  }
//  }
//  </style><h1 class="title-heading"></h1>`;

      //  const filename = "/src/routes/index.svelte";

      //  const result = wrappedPreprocessor(code, filename).code;

      //  expect(result.replace(/\s/g, "")).toBe(
        //  `<style>
    //  :global(.a){
        //  font-size: 58px;
    //  }
    //  :global(.b){
        //  font-family: var(--display-font);
    //  }
    //  :global(.c){
        //  font-weight: 700;
    //  }
    //  :global(.d){
        //  color: var(--highlight);
    //  }
    //  @media (min-width: 768px){
      //  :global(.e){
          //  font-size: 90px;
      //  }
    //  }
    //  @media (min-width: 1200px){
      //  :global(.f){
          //  font-size: 120px;
      //  }
    //  }
    //  </style>
    //  <h1 class="a b c d e f"></h1>
//  `.replace(/\s/g, "")
      //  );
    //  });
  //  });
//  });
