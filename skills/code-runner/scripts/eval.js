#!/usr/bin/env node
/**
 * Code Runner - Quick Eval
 * Quick JavaScript expression evaluation
 * Usage: node eval.js <expression>
 */

const args = process.argv.slice(2);

function main() {
  const expression = args.join(' ');

  if (!expression) {
    console.error('Usage: node eval.js <expression>');
    console.error('');
    console.error('Examples:');
    console.error('  node eval.js "2 + 2"');
    console.error('  node eval.js "Math.sqrt(16)"');
    console.error('  node eval.js "[1,2,3].map(x => x * 2)"');
    console.error('  node eval.js "new Date().toISOString()"');
    process.exit(1);
  }

  try {
    // Create a safe evaluation context
    const context = {
      Math,
      JSON,
      Date,
      Array,
      Object,
      String,
      Number,
      Boolean,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      encodeURIComponent,
      decodeURIComponent,
      encodeURI,
      decodeURI,
      atob: (s) => Buffer.from(s, 'base64').toString('utf-8'),
      btoa: (s) => Buffer.from(s).toString('base64'),
      console: {
        log: (...args) => console.log(...args),
        error: (...args) => console.error(...args)
      }
    };

    // Create function with context
    const fn = new Function(...Object.keys(context), `return (${expression})`);
    const result = fn(...Object.values(context));

    // Format output
    const output = {
      expression,
      result,
      type: typeof result,
      timestamp: new Date().toISOString()
    };

    // Pretty print result
    if (result === undefined) {
      output.result = 'undefined';
    } else if (result === null) {
      output.result = 'null';
    } else if (typeof result === 'function') {
      output.result = result.toString();
    }

    console.log(JSON.stringify(output, null, 2));

  } catch (err) {
    console.error(JSON.stringify({
      expression,
      error: err.message,
      type: err.name
    }));
    process.exit(1);
  }
}

main();
