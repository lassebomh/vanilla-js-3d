/**
 * @example
 * const value = map.get("foo") ?? never()
 *
 * @param {...never} args
 * @returns {never}
 */
export function never(...args) {
  throw new Error("Unreachable code ran with " + args.map(String));
}

/**
 * @param {*} value
 * @returns {asserts value}
 */
export function assert(value) {
  if (!value) {
    never();
  }
}

export const sleep = (/** @type {number} */ ms) => new Promise((res) => setTimeout(res, ms));

/**
 * A simple query selector. Can only select elements by tagname and id/class and
 * will give an element optional for the former and an element array for the latter.
 * The element type is inferred from the tagname.
 *
 * @template {keyof HTMLElementTagNameMap} TTagName
 * @template {`${'.' | '#'}${string}`} TQuery
 * @param {TTagName} tagname
 * @param {TQuery} query
 * @returns {TQuery extends `#${string}`  ? (HTMLElementTagNameMap[TTagName] | null) : (Array<HTMLElementTagNameMap[TTagName]>)}
 */
export function qs(tagname, query) {
  if (query.startsWith("#")) {
    return /** @type {*} */ (document.querySelector(tagname + query));
  } else {
    return /** @type {*} */ (Array.from(document.querySelectorAll(tagname + query)));
  }
}
