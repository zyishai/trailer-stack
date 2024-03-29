type ReplaceDeep<O extends Record<string, any>, K extends string, V> = 
K extends `${infer Key}.${infer Rest}`
  ? { [P in keyof O]: P extends Key ? ReplaceDeep<O[P], Rest, V> : O[P] }
  : { [P in keyof O]: P extends K ? V : O[P] };
type NonEmptyArray<T> = [T, ...T[]]; 
type Throws<E extends Error = Error> = never & E;
type Maybe<T> = T | null | undefined;
type DeepPartial<T> = T extends Object ? { [P in keyof T]?: DeepPartial<T[P]>; } : T;
