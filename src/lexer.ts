/*** LEXER MODULE ***/

export type TokenKind
    = 'semicolon' | 'typeColon' | 'comma' | 'typeArrow' | 'lambdaArrow'
    | 'closeParen' | 'openParen' | 'closeBrace' | 'openBrace'
    | 'if' | 'else' | 'while' | 'return'
    | 'let' | 'boolean' | 'string' | 'number' | 'operator'
    | 'type' | 'id';

/* Map assigning to each TokenKind its matching RegExp.
 * They appear in the order they should be checked by the tokenizer,
 * e.g. boolean literals must be checked before identifiers,
 * since they would otherwise be lexed as identifiers
 */
const tokenRegexps : [TokenKind, RegExp][] =
    [ ['semicolon', /^;/]
      , ['typeColon', /^:/]
      , ['comma', /^,/]
      , ['typeArrow', /^->/]
      , ['lambdaArrow', /^=>/]
      , ['closeParen', /^[)]/]
      , ['openParen', /^[(]/]
      , ['closeBrace', /^[}]/]
      , ['openBrace', /^[{]/]
      , ['if', /^if\b/]
      , ['else', /^else\b/]
      , ['while', /^while\b/]
      , ['let', /^let\b/]
      , ['return', /^return\b/]
      , ['boolean', /^(true|false)\b/]
      , ['string', /^\x22([\x20\x21\x23-\x5b\x5d-\x7e]|\x5c\x22)*\x22/]
      /* 0x22 is the ascii hex-code for double quote.
       * matches an initial double quote, followed by a sequence of
       * - EITHER -
       * printable ascii characters other than the double quote
       * (hex codes 20, 21, and 23 - 7e)
       * - OR -
       * a backslash-escaped double quote (\x5c\x22)
       */
      , ['number', /^[\d]+\b/]
      , ['operator', /^[!@$%^&*<>?/|.=+-]+/]
      , ['type', /^[A-Z]\w*/]
      , ['id', /^[a-z_]\w*/]
    ]

export type Token = {
    kind: TokenKind;
    contents: string;
}

export function Token(kind: Token['kind'], contents: Token['contents']){
    return {kind, contents};
}

function isolateFirstToken(stream: string): [Token, string]
{
    for (let [kind, re] of tokenRegexps){
        let data = re.exec(stream);
        if (data === null)
            continue;
        const match = data[0];
        const token = Token(kind, match);
        const new_stream = stream.slice(match.length);
        return [token, new_stream];
    }
    throw new Error (`lexing error at: ${stream.slice(0, 40)}`)
}

export function lexStream (stream: string): Array<Token>
{
    const token_stream = new Array<Token>;
    stream = stream.trimStart();
    while (stream.length > 0){
        const [token, new_stream] = isolateFirstToken(stream);
        token_stream.push(token);
        stream = new_stream;
        stream = stream.trimStart();
    }
    return token_stream;
}
