/**
 * The is a temporary file until `surrealdb.node` version 0.4.0 will be published to NPM.
 * The definition of the `Surreal` class were mostly copied from the Github source.
 * 
 * There are some minor changes I made:
 * - The type `Binding` used in the `query` method. Originally the type
 * of `bindings` was `Record<string, unknown>` and I replaced it with a strong type that infer the binding
 * names from the query string.
 * - Strong typed `create`, `update`, and `merge` methods.
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
    query<QueryStatement extends string = ''>(sql: QueryStatement, bindings?: Bindings<QueryStatement>): Promise<unknown[]>
    select<Data extends Record<string, unknown>>(resource: string): Promise<({ id: string } & Data)[]>
    create<Data extends Record<string, unknown>>(resource: string, data?: Data): Promise<({ id: string } & Data)[]>
    update<Data extends Record<string, unknown>>(resource: string, data?: Data): Promise<({ id: string } & Data)[]>
    merge<Data extends Record<string, unknown>>(resource: string, data: Partial<Exclude<Data, 'id'>>): Promise<({ id: string } & Data)[]>
    patch(resource: string, data: unknown[]): Promise<unknown[]> // TODO
    delete<Data extends Record<string, unknown>>(resource: string): Promise<({ id: string } & Data)[]>
    version(): Promise<string>
    health(): Promise<void>
  }

}

declare module 'surrealdb.node' {
  export = Surreal;
}
