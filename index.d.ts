type ReplaceDeep<O extends Record<string, any>, K extends string, V> = 
K extends `${infer Key}.${infer Rest}`
  ? { [P in keyof O]: P extends Key ? ReplaceDeep<O[P], Rest, V> : O[P] }
  : { [P in keyof O]: P extends K ? V : O[P] };
