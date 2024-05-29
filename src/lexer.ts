/*** lexer module ***/

// identifiers 
class Identifier {
    static re: RegExp = /^[a-z_]\w*/;
    type: 'id' = 'id';
    contents : string;
    constructor(s: string) {
        this.contents = s;
    }
};

class TypeIdentifier {
    static re: RegExp = /^[A-Z]\w*/;
    type: 'type' = 'type';
    contents : string;
    constructor(s: string) {
        this.contents = s;
    }
};

// operators
class Operator {
    static re: RegExp = /^[!@$%^&*<>?/|.=+-]+/;
    type: 'operator' = 'operator';
    contents: string;
    constructor(s: string) {
        this.contents = s;
    }
};

// number literals
class NumberLiteral {
    static re: RegExp = /^[\d]+\b/;
    type: 'number' = 'number';
    contents: string;
    constructor(s: string) {
        this.contents = s;
    }
};

// string literals
class StringLiteral {
    static re: RegExp = /^\x22([\x20\x21\x23-\x5b\x5d-\x7e]|\x5c\x22)*\x22/;
    /*
     * 22 is the ascii hex-code for double quote.
     * matches an initial double quote, followed by a sequence of
     * - EITHER -
     * printable ascii characters other than the double quote
     * (hex codes 20, 21, and 23 - 7e)
     * - OR -
     * a backslash-escaped double quote (\x5c\x22)
     */
    type: 'string' = 'string';
    contents: string;
    constructor(s: string) {
        this.contents = s;
    }
};

// boolean literals
class BooleanLiteral {
    static re: RegExp = /^(true|false)\b/;
    type: 'boolean' = 'boolean';
    contents: string;
    constructor(s: string) {
        this.contents = s;
    }
};

// keywords
class Keyword {
    static re: RegExp = /^(if|else|let)\b/;
    type: 'keyword' = 'keyword';
    contents: string;
    constructor(s: string) {
        this.contents = s;
    }
};

// special tokens
class OpenBrace {
    static re: RegExp = /^[{]/;
    type: 'open_brace' = 'open_brace';
};

class ClosedBrace {
    static re: RegExp = /^[}]/;
    type: 'closed_brace' = 'closed_brace';
};

class OpenParen {
    static re: RegExp = /^[(]/;
    type: 'open_paren' = 'open_paren';
};

class ClosedParen {
    static re: RegExp = /^[)]/;
    type: 'closed_paren' = 'closed_paren'
};

class TypeColon {
    static re: RegExp = /^:/;
    type: 'type_colon' =  'type_colon';
};

class Semicolon {
    static re: RegExp = /^;/;
    type: 'semicolon' =  'semicolon';
}

export type Token
    = Identifier
    | TypeIdentifier
    | Operator
    | NumberLiteral
    | StringLiteral
    | BooleanLiteral
    | Keyword
    | OpenBrace
    | ClosedBrace
    | OpenParen
    | ClosedParen
    | TypeColon
    | Semicolon;

/* constructors in the order they should be checked
 * e.g. boolean literals must be checked before identifiers,
 * since they would otherwise be lexed as identifiers
 */
const TokensOrdered =
    [ Semicolon
      , TypeColon
      , ClosedParen
      , OpenParen
      , ClosedBrace
      , OpenBrace
      , Keyword
      , BooleanLiteral
      , StringLiteral
      , NumberLiteral
      , Operator
      , TypeIdentifier
      , Identifier
    ];

function isolateFirstToken(stream: string): [Token, string]
{
    stream = stream.trimStart();
    for (let t of TokensOrdered){
        let data = t.re.exec(stream);
        if (data === null)
            continue;
        const match = data[0];
        const token = new t(match);
        const new_stream = stream.slice(match.length);
        return [token, new_stream];
    }
    throw new Error (`lexing error at: ${stream.slice(0, 40)}`)
}

export function lexStream (stream: string): Array<Token>
{
    const token_stream = new Array<Token>;
    while (stream.length > 0){
        const [token, new_stream] = isolateFirstToken(stream);
        token_stream.push(token);
        stream = new_stream;
    }
    return token_stream;
}
