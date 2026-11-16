# Vocabulary plan for the first three lessons

Term ids are kebab-case and shared across lessons. A lesson may use a term only after the segment that introduces it, or if an earlier lesson introduced it. Each lesson writes its own glossary entries to `apps/web/content/glossary/<lesson-id>.yaml` (`<term-id>: { term, definition, aliases: [], spec: optional spec name, introducedIn: <lesson-id> }`). Misconceptions go one per file in `apps/web/content/misconceptions/<id>.yaml` with fields `id, belief, predicts, truth, counterexample, sources, lessons`.

| Lesson | Folder | Id | Introduces |
|---|---|---|---|
| 0.1 How a program runs | `content/foundations/how-programs-run/` | `fnd-how-programs-run` | program, source-code, machine-code, cpu, memory (RAM), address, byte, process, thread, operating-system, compiler, interpreter, engine (JavaScript engine), runtime (host), jit, bytecode, call-stack, stack-frame, heap, garbage-collection (name only; depth in 1.9) |
| 1.1 Values and references | `content/javascript/values-and-references/` | `js-values` | value, primitive, object, reference, binding, identity, mutation, immutable, typeof, strict-equality, loose-equality, coercion, same-value (Object.is), nan, shallow-copy, deep-copy |
| 1.2 Execution context | `content/javascript/execution-context/` | `js-execution-context` | execution-context, environment-record, global-environment, function-environment, outer-reference (the [[OuterEnv]] link), scope-chain (teaching name for the outer chain), declaration-instantiation (spec name; "creation phase" is the teaching name), hoisting (teaching name), tdz (temporal dead zone), global-object, declaration kinds var/let/const/function/param |

Rules every lesson follows:
- Say when a word is a teaching name rather than a spec term ("creation phase" and "hoisting" are not spec terms; the spec says GlobalDeclarationInstantiation and FunctionDeclarationInstantiation).
- Say when a fact is engine behaviour (V8) rather than the language.
- "Stack" and "heap" in 0.1 are about memory regions in general; 1.1 explains that the JS spec does not talk about a stack and a heap, and that "primitives on the stack, objects on the heap" is an engine implementation detail, not a rule. Do not teach it as a rule.
