import { performance } from 'perf_hooks';

/**
 * Benchmark decorator to apply simple benchmarking to
 * a method, which will logged to `console`.
 * @param {'s' | 'ms' | 'ms'} metric - time metric to be used.
 * Defaults to `ms`
 * @param {number?} precision - time precision to be shown on
 * log. Passing `undefined` will log abruptly long string
 * @return {Function}
 */
export function benchmark(
  metric: 's' | 'ms' | 'ns' = 'ms',
  precision?: number,
): Function {
  return function(
    target: any,
    fnName: string,
    descriptor: PropertyDescriptor,
  ): void {
    if (!(descriptor.value instanceof Function)) {
      throw new Error(
        '@Benchmark decorator can only be used in method declarations',
      );
    }

    const fn: Function = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const start = performance.now();

      const result = await fn.apply(this, args);

      const end = performance.now();
      let diff = end - start;

      if (metric !== 'ms') {
        diff = metric === 's' ?
          diff / 1000 :
          diff * 1000;
      }

      console.log(
        // eslint-disable-next-line max-len
        `${fnName} from class ${target.constructor.name} was executed in ${diff.toFixed(precision)} ${metric}`,
      );

      return result;
    };
  };
}
