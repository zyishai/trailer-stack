/**
 * The is a temporary file until `surrealdb.node` version 0.4.0 will be published to NPM.
 * The definition of the `Surreal` class were mostly copied from the Github source.
 * There is one change I made which is the type `Binding` used in the `query` method. Originally the type
 * of `bindings` was `Record<string, unknown>` and I replaced it with a strong type that infer the binding
 * names from the query string.
 * 
 * @link https://github.com/surrealdb/surrealdb.node/blob/main/index.d.ts
 */

declare namespace Surreal {
  type Delimiter = ' ' | ',';
  type ExtractTokens<S extends string, TokenName extends string = '', TokenBegin = false, Tokens extends string[] = []> = S extends `${infer L}${infer Rest}`
    ? TokenBegin extends true
      ? L extends Delimiter
        ? ExtractTokens<Rest, '', false, [...Tokens, TokenName]>
        : ExtractTokens<Rest, `${TokenName}${L}`, true, Tokens>
      : L extends '$'
        ? ExtractTokens<Rest, TokenName, true, Tokens>
        : ExtractTokens<Rest, TokenName, false, Tokens>
    : TokenName extends ''
      ? Tokens
      : [...Tokens, TokenName];

  type Bindings<T extends string> = ExtractTokens<T> extends []
    ? {}
    : { [P in ExtractTokens<T>[number]]: unknown };

  export class Surreal {
    constructor()
    connect(endpoint: string, opts?: Record<string, unknown>): Promise<void>
    use(value: { namespace?: string; database?: string }): Promise<void>
    set(key: string, value: unknown): Promise<void>
    unset(key: string): Promise<void>
    signup(credentials: { namespace: string; database: string; scope: string; [k: string]: unknown }): Promise<string>
    signin(credentials: { username: string; password: string } | { namespace: string; username: string; password: string } | { namespace: string; database: string; username: string; password: string } | { namespace: string; database: string; scope: string; [k: string]: unknown }): Promise<string>
    invalidate(): Promise<void>
    authenticate(token: string): Promise<boolean>
    query<T extends string>(sql: T, bindings?: Bindings<T>): Promise<unknown[]>
    select(resource: string): Promise<{ id: string; [k: string]: unknown }[]>
    create(resource: string, data?: Record<string, unknown>): Promise<{ id: string; [k: string]: unknown }[]>
    update(resource: string, data?: Record<string, unknown>): Promise<{ id: string; [k: string]: unknown }[]>
    merge(resource: string, data: Record<string, unknown>): Promise<{ id: string; [k: string]: unknown }[]>
    patch(resource: string, data: unknown[]): Promise<unknown[]>
    delete(resource: string): Promise<{ id: string; [k: string]: unknown }[]>
    version(): Promise<string>
    health(): Promise<void>
  }
}

declare module 'surrealdb.node' {
  export = Surreal;
}
