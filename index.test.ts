import { expect, test, describe } from "bun:test";
import {
  Lambda,
  abs,
  app,
  callByNameReduce,
  normalOrderReduce,
  reify,
  substitute,
  vari,
} from ".";

describe("callByNameReduce", () => {
  test("reduces a simple application", () => {
    const term = app(abs("x", vari("x")), vari("y"));
    expect(callByNameReduce(term)).toEqual(vari("y"));
  });

  test("reduces a nested application", () => {
    const term = app(abs("x", app(vari("x"), vari("y"))), vari("z"));
    expect(callByNameReduce(term)).toEqual(app(vari("z"), vari("y")));
  });

  test("does not reduce applications inside of abstractions", () => {
    const term = abs("x", app(abs("y", vari("y")), vari("x")));
    expect(callByNameReduce(term)).toEqual(term);
  });
});

describe("normalOrderReduce", () => {
  test("reduces a simple application", () => {
    const term = app(abs("x", vari("x")), vari("y"));
    expect(normalOrderReduce(term)).toEqual(vari("y"));
  });

  test("reduces a nested application", () => {
    const term = app(abs("x", app(vari("x"), vari("y"))), vari("z"));
    expect(normalOrderReduce(term)).toEqual(app(vari("z"), vari("y")));
  });

  test("reduces applications inside of abstractions", () => {
    const term = abs("x", app(abs("y", vari("y")), vari("x")));
    expect(normalOrderReduce(term)).toEqual(abs("x", vari("x")));
  });
});

describe("substitute", () => {
  test("replaces a variable with a variable", () => {
    expect(substitute(vari("x"), "x", vari("y"))).toEqual(vari("y"));
  });

  test("replaces a variable with an abstraction", () => {
    expect(substitute(vari("x"), "x", abs("y", vari("y")))).toEqual(
      abs("y", vari("y"))
    );
  });

  test("replaces a variable with an application", () => {
    expect(substitute(vari("x"), "x", app(vari("y"), vari("z"))));
  });

  test("avoids variable capture", () => {
    expect(substitute(abs("z", vari("x")), "x", vari("z"))).toEqual(
      abs("z", vari("x"))
    );
  });

  test("avoids variable capture on nested abstractions", () => {
    expect(substitute(abs("z", abs("y", vari("x"))), "x", vari("z"))).toEqual(
      abs("z", abs("y", vari("x")))
    );

    expect(substitute(abs("z", abs("y", vari("x"))), "x", vari("y"))).toEqual(
      abs("z", abs("y", vari("x")))
    );
  });
});

describe("reify", () => {
  test("reifies a variable", () => {
    expect(reify(vari("x"))).toEqual(vari("0"));
  });

  test("reifies an abstraction", () => {
    expect(reify(abs("x", vari("x")))).toEqual(abs("0", vari("0")));
  });
});
