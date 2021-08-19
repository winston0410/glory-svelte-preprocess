import { getDeclaration } from "./helper.js";

//  getDeclaration
describe("when given a declaration with url() as value", () => {
  const ast = {
    type: "Declaration",
    important: false,
    property: "blackground",
    value: {
      type: "Value",
      children: [
        {
          type: "Url",
          value: {
            type: "Raw",
            value: "./background.jpg",
            start: 52,
            end: 68,
          },
          start: 48,
          end: 69,
        },
      ],
      start: 47,
      end: 69,
    },
    start: 35,
    end: 69,
  };
  it("should parse it correctly", function () {
    expect(getDeclaration(ast)).toBe("blackground:url(./background.jpg);");
  });
});

describe("when given a declaration with Hex code as value", function () {
  const ast = {
    type: "Declaration",
    important: false,
    property: "color",
    value: {
      type: "Value",
      children: [
        {
          type: "HexColor",
          value: "ffffff",
          start: 42,
          end: 49,
        },
      ],
      start: 41,
      end: 49,
    },
    start: 35,
    end: 49,
  };
  it("should parse it correctly", function () {
    expect(getDeclaration(ast)).toBe("color:#ffffff;");
  });
});

describe("when given a declaration with multiple numbers as value", function () {
  const ast = {
    type: "Declaration",
    important: false,
    property: "margin",
    value: {
      type: "Value",
      children: [
        {
          type: "Dimension",
          value: "0",
          unit: "px",
          start: 43,
          end: 46,
        },
        {
          type: "WhiteSpace",
          loc: null,
          value: " ",
        },
        {
          type: "Dimension",
          value: "5",
          unit: "px",
          start: 47,
          end: 50,
        },
        {
          type: "WhiteSpace",
          loc: null,
          value: " ",
        },
        {
          type: "Dimension",
          value: "10",
          unit: "px",
          start: 51,
          end: 55,
        },
        {
          type: "WhiteSpace",
          loc: null,
          value: " ",
        },
        {
          type: "Dimension",
          value: "15",
          unit: "px",
          start: 56,
          end: 60,
        },
      ],
      start: 42,
      end: 60,
    },
    start: 35,
    end: 60,
  };

  it("should parse it correctly", function () {
    expect(getDeclaration(ast)).toBe("margin:0px 5px 10px 15px;");
  });
});

describe("when given a declaration that uses rgb() as its value", function () {
  const ast = {
    type: "Declaration",
    important: false,
    property: "box-shadow",
    value: {
      type: "Value",
      children: [
        {
          type: "Number",
          value: "0",
          start: 47,
          end: 48,
        },
        {
          type: "WhiteSpace",
          loc: null,
          value: " ",
        },
        {
          type: "Number",
          value: "0",
          start: 49,
          end: 50,
        },
        {
          type: "WhiteSpace",
          loc: null,
          value: " ",
        },
        {
          type: "Dimension",
          value: "2",
          unit: "px",
          start: 51,
          end: 54,
        },
        {
          type: "WhiteSpace",
          loc: null,
          value: " ",
        },
        {
          type: "Number",
          value: "0",
          start: 55,
          end: 56,
        },
        {
          type: "WhiteSpace",
          loc: null,
          value: " ",
        },
        {
          type: "Function",
          name: "rgb",
          children: [
            {
              type: "Number",
              value: "47",
              start: 61,
              end: 63,
            },
            {
              type: "WhiteSpace",
              loc: null,
              value: " ",
            },
            {
              type: "Number",
              value: "52",
              start: 64,
              end: 66,
            },
            {
              type: "WhiteSpace",
              loc: null,
              value: " ",
            },
            {
              type: "Number",
              value: "61",
              start: 67,
              end: 69,
            },
            {
              type: "WhiteSpace",
              loc: null,
              value: " ",
            },
            {
              type: "Operator",
              value: "/",
              start: 70,
              end: 71,
            },
            {
              type: "WhiteSpace",
              loc: null,
              value: " ",
            },
            {
              type: "Percentage",
              value: "8",
              start: 72,
              end: 74,
            },
          ],
          start: 57,
          end: 75,
        },
      ],
      start: 46,
      end: 75,
    },
    start: 35,
    end: 75,
  };
  it("should parse it correctly", function () {
    expect(getDeclaration(ast)).toBe(
      "box-shadow:0 0 2px 0 rgb(47 52 61 / 8%);"
    );
  });
});

describe("when given a declaration that uses var() as its value", function () {
  const ast = {
    type: "Declaration",
    important: false,
    property: "color",
    value: {
      type: "Value",
      children: [
        {
          type: "Function",
          name: "var",
          children: [
            {
              type: "Identifier",
              name: "--highlight",
              start: 46,
              end: 57,
            },
          ],
          start: 42,
          end: 58,
        },
      ],
      start: 41,
      end: 58,
    },
    start: 35,
    end: 58,
  };
  it("should parse it correctly", function () {
    expect(getDeclaration(ast)).toBe("color:var(--highlight);");
  });
});
