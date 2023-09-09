interface Variable {
  type: "Variable";
  name: string;
}

interface Abstraction {
  type: "Abstraction";
  name: string;
  body: Lambda;
}

interface Application {
  type: "Application";
  left: Lambda;
  right: Lambda;
}

export type Lambda = Variable | Abstraction | Application;

export function toString(term: Lambda): string {
  switch (term.type) {
    case "Variable":
      return term.name;
    case "Abstraction":
      return `λ${term.name}.${toString(term.body)}`;
    case "Application":
      return `(${toString(term.left)} ${toString(term.right)})`;
  }
}

export function vari(name: string): Variable {
  return { type: "Variable", name };
}

export function abs(name: string, body: Lambda): Abstraction {
  return { type: "Abstraction", name, body };
}

export function app(left: Lambda, right: Lambda): Application {
  return { type: "Application", left, right };
}

export function substitute(
  term: Lambda,
  name: string,
  replacement: Lambda
): Lambda {
  switch (term.type) {
    case "Variable":
      return term.name === name ? replacement : term;
    case "Abstraction":
      if (term.name === name) {
        return term;
      }

      // [x->s](λy.t) = { λy.t }        if y = x
      //                { λy.[x->s]t }  if y != x and y ∉ FV(s)
      const freeVars = freeVariables(replacement);
      if (freeVars.includes(term.name)) {
        return term;
      }

      return {
        ...term,
        body: substitute(term.body, name, replacement),
      };
    case "Application":
      return {
        ...term,
        left: substitute(term.left, name, replacement),
        right: substitute(term.right, name, replacement),
      };
  }
}

function freeVariables(term: Lambda): string[] {
  switch (term.type) {
    case "Variable":
      return [term.name];
    case "Abstraction":
      return freeVariables(term.body).filter((name) => name !== term.name);
    case "Application":
      return [...freeVariables(term.left), ...freeVariables(term.right)];
  }
}

export function callByNameReduce(term: Lambda) {
  switch (term.type) {
    case "Variable":
      return term;
    case "Abstraction":
      return term;
    case "Application":
      const { left, right } = term;
      if (left.type === "Abstraction") {
        return substitute(left.body, left.name, right);
      }
      throw new Error("Cannot beta reduce");
  }
}

export function normalOrderReduce(term: Lambda): Lambda {
  switch (term.type) {
    case "Variable":
      return term;
    case "Abstraction":
      return { ...term, body: normalOrderReduce(term.body) };
    case "Application":
      const { left, right } = term;
      if (left.type === "Abstraction") {
        return substitute(left.body, left.name, right);
      }
      throw new Error("Cannot beta reduce");
  }
}

export function reify(term: Lambda) {
  function inner(
    term: Lambda,
    map: Record<string, number>
  ): [Lambda, Record<string, number>] {
    switch (term.type) {
      case "Variable":
        if (map[term.name] === undefined) {
          map[term.name] = Object.keys(map).length;
        }
        return [{ type: "Variable", name: map[term.name].toString() }, map];
      case "Abstraction":
        const [body, newMap] = inner(term.body, map);
        return [
          { type: "Abstraction", name: map[term.name].toString(), body },
          newMap,
        ];
      case "Application":
        const [left, leftMap] = inner(term.left, map);
        const [right, rightMap] = inner(term.right, leftMap);
        return [{ type: "Application", left, right }, rightMap];
    }
  }
  return inner(term, {})[0];
}
