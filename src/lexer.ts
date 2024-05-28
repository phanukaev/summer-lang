/*** lexer module ***/

// identifiers 
class identifier_token {
    static re: RegExp  = /[a-zA-Z]\w*/;
    type: 'identifier';
    contents : string;
    constructor(s: string) {
        this.type = 'identifier';
        this.contents = s;
    }
};

// operators
class operator_token {
    static re: RegExp = /[!@#$%^&*<>?/|.-=+]+/;
    type: 'operator';
    contents: string;
    constructor(s: string) {
        this.type = 'operator';
        this.contents = s;
    }
};

// number literals
class number_token {
    static re: RegExp = /\b[\d]+\b/;
    type: 'number';
    contents: string;
    constructor(s: string) {
        this.type = 'number';
        this.contents = s;
    }
};

// string literals
class string_token {
    static re: RegExp = /\x22([\x20\x21\x23-\x7e]|\x5c\x22)*\x22"/;
    /*
     * 22 is the ascii hex-code for double quote.
     * matches an initial double quote, followed by a sequence of
     * - EITHER -
     * printable ascii characters other than the double quote
     * (hex codes 20, 21, and 23 - 7e)
     * - OR -
     * a backslash-escaped double quote (\x5c\x22)
     */
    type: 'string';
    contents: string;
    constructor(s: string) {
        this.type = 'string';
        this.contents = s;
    }
};

// boolean literals
class boolean_token {
    static re: RegExp = /\b(true|false)\b/;
    type: 'boolean';
    contents: string;
    constructor(s: string) {
        this.type = 'boolean';
        this.contents = s;
    }
};

// keywords
class keyword_token {
    static re: RegExp = /\b(if|else|let)\b/;
    type: 'keyword';
    contents: string;
    constructor(s: string) {
        this.type = 'keyword';
        this.contents = s;
    }
};

// special tokens
class open_brace_token {
    static re: RegExp = /[{]/;
    type: 'open_brace'
    constructor(_: string) {
        this.type = 'open_brace';
    }
};

class closed_brace_token {
    static re: RegExp = /[}]/;
    type: 'closed_brace'
    constructor(_: string) {
        this.type = 'closed_brace';
    }
};

class open_paren_token {
    static re: RegExp = /[(]/;
    type: 'open_paren'
    constructor(_: string) {
        this.type = 'open_paren';
    }
};

class closed_paren_token {
    static re: RegExp = /[)]/;
    type: 'closed_paren'
    constructor(_: string) {
        this.type = 'closed_paren';
    }
};

class type_colon_token {
    static re: RegExp = /:/;
    type: 'type_colon'
    constructor(_: string) {
        this.type = 'type_colon';
    }
};

class assign_token {
    static re: RegExp = /=/;
    type: 'assign'
    constructor(_: string) {
        this.type = 'assign';
    }
};

type token
    = identifier_token
    | operator_token
    | number_token
    | string_token
    | boolean_token
    | keyword_token
    | open_brace_token
    | closed_brace_token
    | open_paren_token
    | closed_paren_token
    | type_colon_token
    | assign_token ;

const token_constructors_ordered
    = [ assign_token
      , type_colon_token
      , closed_paren_token
      , open_paren_token
      , closed_brace_token
      , open_brace_token
      , keyword_token
      , boolean_token
      , string_token
      , number_token
      , operator_token
      , identifier_token
    ];

function isolate_first_token(stream: string): [token, string]
{
    // regexes in the order they should be checked
    stream = stream.trimStart();
    for (let t of token_constructors_ordered){
        let data = t.re.exec(stream);
        if (data !== null){
            const match = data[0];
            const index = data.index;
            const token = new t (match);
            const new_stream = stream.slice(index);
            return [token, new_stream];
        }
    }
    throw new Error (`lexing error at:\n\t${stream.slice(0, 40)}`)
}

export default function lex_stream (stream: string): Array<token>
{
    const token_stream = new Array<token>;
    while (stream.length > 0){
        const [token, new_stream] = isolate_first_token(stream);
        token_stream.push(token);
        stream = new_stream;
    }
    return token_stream;
}
