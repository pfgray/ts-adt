export interface CompileError<ErrorMessageT extends any> {
    /**
     * There should never be a value of this type
     */
    readonly __compileError : never;
}