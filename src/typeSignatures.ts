export type TypeVar = { kind: 'typeVar'; name: number };
export type TypeName = { kind: 'typeName'; name: string };
export type Type = TypeVar | TypeName;

export function TypeVar (n: number): TypeVar {
    return { kind: 'typeVar', name: n };
}
export function TypeName (s: string): TypeName {
    return { kind: 'typeName', name: s };
}
export type TypeSignature = {
    inputTypes: Array<Type>;
    returnType: Type;
}

