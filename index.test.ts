import { expect, test, describe } from "bun:test";
import {
  Lambda,
  callByNameReduce,
  normalOrderReduce,
  reify,
  substitute,
} from ".";

describe("callByNameReduce", () => {
  test("reduces a simple application", () => {
    const term: Lambda = {
      type: "Application",
      left: {
        type: "Abstraction",
        name: "x",
        body: { type: "Variable", name: "x" },
      },
      right: { type: "Variable", name: "y" },
    };
    expect(callByNameReduce(term)).toEqual({ type: "Variable", name: "y" });
  });

  test("reduces a nested application", () => {
    const term: Lambda = {
      type: "Application",
      left: {
        type: "Abstraction",
        name: "x",
        body: {
          type: "Application",
          left: { type: "Variable", name: "x" },
          right: { type: "Variable", name: "y" },
        },
      },
      right: { type: "Variable", name: "z" },
    };
    expect(callByNameReduce(term)).toEqual({
      type: "Application",
      left: { type: "Variable", name: "z" },
      right: { type: "Variable", name: "y" },
    });
  });

  test("does not reduce applications inside of abstractions", () => {
    const term: Lambda = {
      type: "Abstraction",
      name: "x",
      body: {
        type: "Application",
        left: {
          type: "Abstraction",
          name: "y",
          body: { type: "Variable", name: "y" },
        },
        right: { type: "Variable", name: "x" },
      },
    };
    expect(callByNameReduce(term)).toEqual(term);
  });
});

describe("normalOrderReduce", () => {
  test("reduces a simple application", () => {
    const term: Lambda = {
      type: "Application",
      left: {
        type: "Abstraction",
        name: "x",
        body: { type: "Variable", name: "x" },
      },
      right: { type: "Variable", name: "y" },
    };
    expect(normalOrderReduce(term)).toEqual({ type: "Variable", name: "y" });
  });

  test("reduces a nested application", () => {
    const term: Lambda = {
      type: "Application",
      left: {
        type: "Abstraction",
        name: "x",
        body: {
          type: "Application",
          left: { type: "Variable", name: "x" },
          right: { type: "Variable", name: "y" },
        },
      },
      right: { type: "Variable", name: "z" },
    };
    expect(normalOrderReduce(term)).toEqual({
      type: "Application",
      left: { type: "Variable", name: "z" },
      right: { type: "Variable", name: "y" },
    });
  });

  test("reduces applications inside of abstractions", () => {
    const term: Lambda = {
      type: "Abstraction",
      name: "x",
      body: {
        type: "Application",
        left: {
          type: "Abstraction",
          name: "y",
          body: { type: "Variable", name: "y" },
        },
        right: { type: "Variable", name: "x" },
      },
    };
    expect(normalOrderReduce(term)).toEqual({
      type: "Abstraction",
      name: "x",
      body: { type: "Variable", name: "x" },
    });
  });
});

describe("substitute", () => {
  test("replaces a variable with a variable", () => {
    const term: Lambda = { type: "Variable", name: "x" };
    expect(substitute(term, "x", { type: "Variable", name: "y" })).toEqual({
      type: "Variable",
      name: "y",
    });
  });

  test("replaces a variable with an abstraction", () => {
    const term: Lambda = { type: "Variable", name: "x" };
    expect(
      substitute(term, "x", {
        type: "Abstraction",
        name: "y",
        body: { type: "Variable", name: "y" },
      })
    ).toEqual({
      type: "Abstraction",
      name: "y",
      body: { type: "Variable", name: "y" },
    });
  });

  test("replaces a variable with an application", () => {
    const term: Lambda = { type: "Variable", name: "x" };
    expect(
      substitute(term, "x", {
        type: "Application",
        left: { type: "Variable", name: "y" },
        right: { type: "Variable", name: "z" },
      })
    ).toEqual({
      type: "Application",
      left: { type: "Variable", name: "y" },
      right: { type: "Variable", name: "z" },
    });
  });

  test("avoids variable capture", () => {
    const term: Lambda = {
      type: "Abstraction",
      name: "z",
      body: {
        type: "Variable",
        name: "x",
      },
    };
    expect(
      substitute(term, "x", {
        type: "Variable",
        name: "z",
      })
    ).toEqual({
      type: "Abstraction",
      name: "z",
      body: {
        type: "Variable",
        name: "x",
      },
    });
  });

  test("avoids variable capture on nested abstractions", () => {
    const term: Lambda = {
      type: "Abstraction",
      name: "z",
      body: {
        type: "Abstraction",
        name: "y",
        body: {
          type: "Variable",
          name: "x",
        },
      },
    };
    expect(
      substitute(term, "x", {
        type: "Variable",
        name: "z",
      })
    ).toEqual(term);

    expect(
      substitute(term, "x", {
        type: "Variable",
        name: "y",
      })
    ).toEqual(term);
  });
});

describe("reify", () => {
  test("reifies a variable", () => {
    const term: Lambda = { type: "Variable", name: "x" };
    expect(reify(term)).toEqual({
      type: "Variable",
      name: "0",
    });
  });

  test("reifies an abstraction", () => {
    const term: Lambda = {
      type: "Abstraction",
      name: "x",
      body: { type: "Variable", name: "x" },
    };
    expect(reify(term)).toEqual({
      type: "Abstraction",
      name: "0",
      body: {
        type: "Variable",
        name: "0",
      },
    });
  });
});
