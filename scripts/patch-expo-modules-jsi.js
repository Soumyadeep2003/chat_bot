const fs = require('fs');
const path = require('path');

const runtimePath = path.resolve(
  __dirname,
  '../node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI/Runtime/JavaScriptRuntime.swift'
);

if (!fs.existsSync(runtimePath)) {
  process.exit(0);
}

let source = fs.readFileSync(runtimePath, 'utf8');

const patches = [
  [
    `nonisolated(unsafe) let resultPtr = resultPtr`,
    `let resultPtr = NonisolatedUnsafeVar(resultPtr)`,
  ],
  [
    `            try context.get(propertyName).writeJSIValue(to: resultPtr)`,
    `            try context.get(propertyName).writeJSIValue(to: resultPtr.value)`,
  ],
  [
    `nonisolated(unsafe) let thisPtr = thisPtr`,
    `let thisPtr = NonisolatedUnsafeVar(thisPtr)`,
  ],
  [
    `nonisolated(unsafe) let argumentsPtr = argumentsPtr`,
    `let argumentsPtr = NonisolatedUnsafeVar(argumentsPtr)`,
  ],
  [
    `let arguments = JavaScriptValuesBuffer(runtime, start: argumentsPtr, count: argumentsCount)`,
    `let arguments = JavaScriptValuesBuffer(runtime, start: argumentsPtr.value, count: argumentsCount)`,
  ],
  [
    `let this = UnsafeMutablePointer(mutating: thisPtr).move()`,
    `let this = UnsafeMutablePointer(mutating: thisPtr.value).move()`,
  ],
  [
    `let thisValue = JavaScriptUnownedValue(runtime.pointee, thisPtr)`,
    `let thisValue = JavaScriptUnownedValue(runtime.pointee, thisPtr.value)`,
  ],
  [
    `try context.call(thisValue, consume arguments).writeJSIValue(to: resultPtr)`,
    `try context.call(thisValue, consume arguments).writeJSIValue(to: resultPtr.value)`,
  ],
];

for (const [before, after] of patches) {
  if (source.includes(before)) {
    source = source.replaceAll(before, after);
  } else if (!source.includes(after)) {
    throw new Error(`Unable to patch expo-modules-jsi: pattern not found in ${runtimePath}`);
  }
}

fs.writeFileSync(runtimePath, source);
