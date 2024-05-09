export function hasObjectPrototype(o: unknown): boolean {
  return Object.prototype.toString.call(o) === '[object Object]';
}

export function isPlainObject(o: unknown): o is Record<string, unknown> {
  if (!hasObjectPrototype(o)) {
    return false;
  }

  // If has no constructor
  const ctor = (o as Record<string, unknown>).constructor as
    | ObjectConstructor
    | undefined;
  if (ctor === undefined) {
    return true;
  }

  // If has modified prototype
  const prot = ctor.prototype;
  if (!hasObjectPrototype(prot)) {
    return false;
  }

  // If constructor does not have an Object-specific method
  if (!Object.prototype.hasOwnProperty.call(prot, 'isPrototypeOf')) {
    return false;
  }

  // Most likely a plain Object
  return true;
}

export function hashKey(queryKey: unknown[]): string {
  return JSON.stringify(queryKey, (_, val: unknown) =>
    isPlainObject(val)
      ? Object.keys(val)
          .sort()
          .reduce<Record<string, unknown>>((result, key) => {
            result[key] = val[key];
            return result;
          }, {})
      : val
  );
}
