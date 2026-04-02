"use strict";
/**
 * @file 编译器流水线
 * @category Compiler → Pipeline
 * @difficulty hard
 * @tags compiler, lexer, parser, ast, code-generation
 *
 * 本文件实现了一个类型安全、无 any 的 Mini-Compiler，核心阶段：
 * 词法分析 (Lexing) → 语法分析 (Parsing) → AST → 优化 (Optimization) → 代码生成 (Code Generation)
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeGenerator = exports.Optimizer = exports.Parser = exports.Lexer = exports.TokenType = void 0;
exports.demo = demo;
// ==================== Token 定义 ====================
var TokenType;
(function (TokenType) {
    TokenType["NUMBER"] = "NUMBER";
    TokenType["STRING"] = "STRING";
    TokenType["IDENTIFIER"] = "IDENTIFIER";
    TokenType["KEYWORD"] = "KEYWORD";
    TokenType["OPERATOR"] = "OPERATOR";
    TokenType["PUNCTUATION"] = "PUNCTUATION";
    TokenType["EOF"] = "EOF";
})(TokenType || (exports.TokenType = TokenType = {}));
// ==================== 词法分析器 (Lexer) ====================
var Lexer = /** @class */ (function () {
    function Lexer(source) {
        this.source = source;
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.keywords = new Set([
            'let', 'const', 'function', 'if', 'else', 'return', 'while', 'for',
            'true', 'false', 'null'
        ]);
    }
    /**
     * 将源代码拆分为 Token 数组。
     * 支持：行注释、块注释、字符串转义、负数字面量。
     */
    Lexer.prototype.tokenize = function () {
        var tokens = [];
        var expectOperand = true; // 用于判断 '-' 是负号还是减号运算符
        while (this.position < this.source.length) {
            this.skipWhitespaceAndComments();
            if (this.position >= this.source.length)
                break;
            var char = this.source[this.position];
            if (this.isDigit(char)) {
                tokens.push(this.readNumber());
                expectOperand = false;
            }
            else if (char === '-' && expectOperand && this.isDigit(this.source[this.position + 1] || '')) {
                this.advance(); // 消费 '-'
                tokens.push(this.readNumber(true));
                expectOperand = false;
            }
            else if (this.isAlpha(char)) {
                var token = this.readIdentifier();
                tokens.push(token);
                expectOperand = token.type === TokenType.KEYWORD;
            }
            else if (char === '"' || char === "'") {
                tokens.push(this.readString());
                expectOperand = false;
            }
            else if (this.isOperator(char)) {
                tokens.push(this.readOperator());
                expectOperand = true;
            }
            else if (this.isPunctuation(char)) {
                var token = this.readPunctuation();
                tokens.push(token);
                expectOperand =
                    token.value === '(' ||
                        token.value === '[' ||
                        token.value === '{' ||
                        token.value === ',' ||
                        token.value === ';';
            }
            else {
                this.advance();
            }
        }
        tokens.push({ type: TokenType.EOF, value: '', line: this.line, column: this.column });
        return tokens;
    };
    Lexer.prototype.readNumber = function (negative) {
        if (negative === void 0) { negative = false; }
        var startColumn = negative ? this.column - 1 : this.column;
        var start = this.position;
        var hasDot = false;
        while (this.position < this.source.length) {
            var char = this.peek();
            if (this.isDigit(char)) {
                this.advance();
            }
            else if (char === '.') {
                if (hasDot)
                    break;
                hasDot = true;
                this.advance();
            }
            else {
                break;
            }
        }
        var raw = this.source.slice(start, this.position);
        var value = negative ? '-' + raw : raw;
        return {
            type: TokenType.NUMBER,
            value: value,
            line: this.line,
            column: startColumn
        };
    };
    Lexer.prototype.readIdentifier = function () {
        var start = this.position;
        var startColumn = this.column;
        while (this.isAlphaNumeric(this.peek())) {
            this.advance();
        }
        var value = this.source.slice(start, this.position);
        var isKeyword = this.keywords.has(value);
        return {
            type: isKeyword ? TokenType.KEYWORD : TokenType.IDENTIFIER,
            value: value,
            line: this.line,
            column: startColumn
        };
    };
    Lexer.prototype.readString = function () {
        var quote = this.source[this.position];
        var startColumn = this.column;
        this.advance(); // 跳过开始引号
        var value = '';
        while (this.position < this.source.length && this.peek() !== quote) {
            var ch = this.peek();
            if (ch === '\\') {
                this.advance();
                var next = this.peek();
                switch (next) {
                    case 'n':
                        value += '\n';
                        break;
                    case 't':
                        value += '\t';
                        break;
                    case 'r':
                        value += '\r';
                        break;
                    case '"':
                        value += '"';
                        break;
                    case "'":
                        value += "'";
                        break;
                    case '\\':
                        value += '\\';
                        break;
                    default:
                        value += next;
                        break;
                }
                this.advance();
            }
            else {
                value += ch;
                this.advance();
            }
        }
        if (this.peek() === quote) {
            this.advance(); // 跳过结束引号
        }
        return {
            type: TokenType.STRING,
            value: value,
            line: this.line,
            column: startColumn
        };
    };
    Lexer.prototype.readOperator = function () {
        var startColumn = this.column;
        var operators = [
            '===', '!==', '==', '!=', '<=', '>=',
            '&&', '||',
            '++', '--',
            '+', '-', '*', '/', '=', '<', '>', '!'
        ];
        for (var _i = 0, operators_1 = operators; _i < operators_1.length; _i++) {
            var op = operators_1[_i];
            if (this.source.slice(this.position, this.position + op.length) === op) {
                for (var i = 0; i < op.length; i++) {
                    this.advance();
                }
                return {
                    type: TokenType.OPERATOR,
                    value: op,
                    line: this.line,
                    column: startColumn
                };
            }
        }
        // 兜底：消费一个未知字符作为单字符运算符
        var value = this.source[this.position];
        this.advance();
        return {
            type: TokenType.OPERATOR,
            value: value,
            line: this.line,
            column: startColumn
        };
    };
    Lexer.prototype.readPunctuation = function () {
        var startColumn = this.column;
        var value = this.source[this.position];
        this.advance();
        return {
            type: TokenType.PUNCTUATION,
            value: value,
            line: this.line,
            column: startColumn
        };
    };
    Lexer.prototype.skipWhitespaceAndComments = function () {
        while (this.position < this.source.length) {
            var char = this.source[this.position];
            if (/\s/.test(char)) {
                if (char === '\n') {
                    this.line++;
                    this.column = 1;
                    this.position++;
                }
                else {
                    this.advance();
                }
            }
            else if (char === '/' && this.source[this.position + 1] === '/') {
                // 跳过行注释
                this.position += 2;
                this.column += 2;
                while (this.position < this.source.length && this.source[this.position] !== '\n') {
                    this.advance();
                }
            }
            else if (char === '/' && this.source[this.position + 1] === '*') {
                // 跳过块注释
                this.position += 2;
                this.column += 2;
                while (this.position < this.source.length &&
                    !(this.source[this.position] === '*' && this.source[this.position + 1] === '/')) {
                    if (this.source[this.position] === '\n') {
                        this.line++;
                        this.column = 1;
                        this.position++;
                    }
                    else {
                        this.advance();
                    }
                }
                if (this.position < this.source.length) {
                    this.advance(); // *
                    this.advance(); // /
                }
            }
            else {
                break;
            }
        }
    };
    Lexer.prototype.advance = function () {
        this.position++;
        this.column++;
    };
    Lexer.prototype.peek = function () {
        return this.position < this.source.length ? this.source[this.position] : '\0';
    };
    Lexer.prototype.isDigit = function (char) {
        return /\d/.test(char);
    };
    Lexer.prototype.isAlpha = function (char) {
        return /[a-zA-Z_]/.test(char);
    };
    Lexer.prototype.isAlphaNumeric = function (char) {
        return /[a-zA-Z0-9_]/.test(char);
    };
    Lexer.prototype.isOperator = function (char) {
        return /[+\-*/=<>!&|]/.test(char);
    };
    Lexer.prototype.isPunctuation = function (char) {
        return /[(){}\[\],;.]/.test(char);
    };
    return Lexer;
}());
exports.Lexer = Lexer;
// ==================== 语法分析器 (Parser) ====================
var Parser = /** @class */ (function () {
    function Parser(tokens) {
        this.position = 0;
        this.tokens = tokens;
    }
    Parser.prototype.parse = function () {
        var statements = [];
        while (this.current().type !== TokenType.EOF) {
            statements.push(this.parseStatement());
        }
        return { type: 'Program', body: statements };
    };
    Parser.prototype.parseStatement = function () {
        if (this.match(TokenType.KEYWORD, 'let') || this.match(TokenType.KEYWORD, 'const')) {
            return this.parseVariableDeclaration();
        }
        if (this.match(TokenType.KEYWORD, 'function')) {
            return this.parseFunctionDeclaration();
        }
        if (this.match(TokenType.KEYWORD, 'if')) {
            return this.parseIfStatement();
        }
        if (this.match(TokenType.KEYWORD, 'return')) {
            return this.parseReturnStatement();
        }
        return this.parseExpressionStatement();
    };
    Parser.prototype.parseVariableDeclaration = function () {
        var kindToken = this.consume(TokenType.KEYWORD);
        var kind = kindToken.value === 'const' ? 'const' : 'let';
        var id = this.consume(TokenType.IDENTIFIER).value;
        var init = null;
        if (this.match(TokenType.OPERATOR, '=')) {
            this.consume(TokenType.OPERATOR);
            init = this.parseExpression();
        }
        this.skipSemicolon();
        return { type: 'VariableDeclaration', kind: kind, id: id, init: init };
    };
    Parser.prototype.parseFunctionDeclaration = function () {
        this.consume(TokenType.KEYWORD); // function
        var name = this.consume(TokenType.IDENTIFIER).value;
        this.consume(TokenType.PUNCTUATION, '(');
        var params = [];
        while (!this.match(TokenType.PUNCTUATION, ')')) {
            params.push(this.consume(TokenType.IDENTIFIER).value);
            if (this.match(TokenType.PUNCTUATION, ',')) {
                this.consume(TokenType.PUNCTUATION);
            }
        }
        this.consume(TokenType.PUNCTUATION, ')');
        var body = this.parseBlock();
        return { type: 'FunctionDeclaration', name: name, params: params, body: body };
    };
    Parser.prototype.parseIfStatement = function () {
        this.consume(TokenType.KEYWORD); // if
        this.consume(TokenType.PUNCTUATION, '(');
        var test = this.parseExpression();
        this.consume(TokenType.PUNCTUATION, ')');
        var consequent = this.match(TokenType.PUNCTUATION, '{')
            ? this.parseBlock()
            : this.parseExpressionStatement();
        var alternate = null;
        if (this.match(TokenType.KEYWORD, 'else')) {
            this.consume(TokenType.KEYWORD);
            if (this.match(TokenType.KEYWORD, 'if')) {
                alternate = this.parseIfStatement();
            }
            else if (this.match(TokenType.PUNCTUATION, '{')) {
                alternate = this.parseBlock();
            }
            else {
                alternate = this.parseExpressionStatement();
            }
        }
        return { type: 'IfStatement', test: test, consequent: consequent, alternate: alternate };
    };
    Parser.prototype.parseReturnStatement = function () {
        this.consume(TokenType.KEYWORD);
        var argument = this.match(TokenType.PUNCTUATION, ';') ? null : this.parseExpression();
        this.skipSemicolon();
        return { type: 'ReturnStatement', argument: argument };
    };
    Parser.prototype.parseExpressionStatement = function () {
        var expression = this.parseExpression();
        this.skipSemicolon();
        return { type: 'ExpressionStatement', expression: expression };
    };
    Parser.prototype.parseBlock = function () {
        this.consume(TokenType.PUNCTUATION, '{');
        var body = [];
        while (!this.match(TokenType.PUNCTUATION, '}')) {
            body.push(this.parseStatement());
        }
        this.consume(TokenType.PUNCTUATION, '}');
        return { type: 'BlockStatement', body: body };
    };
    // ==================== 表达式优先级（从低到高）====================
    Parser.prototype.parseExpression = function () {
        return this.parseAssignment();
    };
    // 1. 赋值 =
    Parser.prototype.parseAssignment = function () {
        var left = this.parseLogicalOr();
        if (this.match(TokenType.OPERATOR, '=')) {
            this.consume(TokenType.OPERATOR);
            var right = this.parseAssignment(); // 右结合
            return { type: 'AssignmentExpression', operator: '=', left: left, right: right };
        }
        return left;
    };
    // 2. 逻辑或 ||
    Parser.prototype.parseLogicalOr = function () {
        var left = this.parseLogicalAnd();
        while (this.match(TokenType.OPERATOR, '||')) {
            var operator = this.consume(TokenType.OPERATOR).value;
            var right = this.parseLogicalAnd();
            left = { type: 'BinaryExpression', operator: operator, left: left, right: right };
        }
        return left;
    };
    // 3. 逻辑与 &&
    Parser.prototype.parseLogicalAnd = function () {
        var left = this.parseEquality();
        while (this.match(TokenType.OPERATOR, '&&')) {
            var operator = this.consume(TokenType.OPERATOR).value;
            var right = this.parseEquality();
            left = { type: 'BinaryExpression', operator: operator, left: left, right: right };
        }
        return left;
    };
    // 4. 相等/比较
    Parser.prototype.parseEquality = function () {
        var left = this.parseAdditive();
        while (this.match(TokenType.OPERATOR, '==') ||
            this.match(TokenType.OPERATOR, '!=') ||
            this.match(TokenType.OPERATOR, '===') ||
            this.match(TokenType.OPERATOR, '!==') ||
            this.match(TokenType.OPERATOR, '<') ||
            this.match(TokenType.OPERATOR, '>') ||
            this.match(TokenType.OPERATOR, '<=') ||
            this.match(TokenType.OPERATOR, '>=')) {
            var operator = this.consume(TokenType.OPERATOR).value;
            var right = this.parseAdditive();
            left = { type: 'BinaryExpression', operator: operator, left: left, right: right };
        }
        return left;
    };
    // 5. 加减 + -
    Parser.prototype.parseAdditive = function () {
        var left = this.parseMultiplicative();
        while (this.match(TokenType.OPERATOR, '+') || this.match(TokenType.OPERATOR, '-')) {
            var operator = this.consume(TokenType.OPERATOR).value;
            var right = this.parseMultiplicative();
            left = { type: 'BinaryExpression', operator: operator, left: left, right: right };
        }
        return left;
    };
    // 6. 乘除 * /
    Parser.prototype.parseMultiplicative = function () {
        var left = this.parseUnary();
        while (this.match(TokenType.OPERATOR, '*') || this.match(TokenType.OPERATOR, '/')) {
            var operator = this.consume(TokenType.OPERATOR).value;
            var right = this.parseUnary();
            left = { type: 'BinaryExpression', operator: operator, left: left, right: right };
        }
        return left;
    };
    // 7. 一元 - !
    Parser.prototype.parseUnary = function () {
        if (this.match(TokenType.OPERATOR, '-') || this.match(TokenType.OPERATOR, '!')) {
            var operator = this.consume(TokenType.OPERATOR).value;
            var argument = this.parseUnary();
            return { type: 'UnaryExpression', operator: operator, argument: argument };
        }
        return this.parsePrimary();
    };
    // 8. 基本表达式
    Parser.prototype.parsePrimary = function () {
        if (this.match(TokenType.NUMBER)) {
            var token = this.consume(TokenType.NUMBER);
            return { type: 'Literal', value: Number(token.value) };
        }
        if (this.match(TokenType.STRING)) {
            var token = this.consume(TokenType.STRING);
            return { type: 'Literal', value: token.value };
        }
        if (this.match(TokenType.KEYWORD, 'true')) {
            this.consume(TokenType.KEYWORD);
            return { type: 'Literal', value: true };
        }
        if (this.match(TokenType.KEYWORD, 'false')) {
            this.consume(TokenType.KEYWORD);
            return { type: 'Literal', value: false };
        }
        if (this.match(TokenType.KEYWORD, 'null')) {
            this.consume(TokenType.KEYWORD);
            return { type: 'Literal', value: null };
        }
        if (this.match(TokenType.IDENTIFIER)) {
            var name_1 = this.consume(TokenType.IDENTIFIER).value;
            if (this.match(TokenType.PUNCTUATION, '(')) {
                return this.parseCallExpression(name_1);
            }
            return { type: 'Identifier', name: name_1 };
        }
        if (this.match(TokenType.PUNCTUATION, '(')) {
            this.consume(TokenType.PUNCTUATION);
            var expression = this.parseExpression();
            this.consume(TokenType.PUNCTUATION, ')');
            return expression;
        }
        throw new Error("Unexpected token: ".concat(this.current().value, " at line ").concat(this.current().line, ", column ").concat(this.current().column));
    };
    Parser.prototype.parseCallExpression = function (callee) {
        this.consume(TokenType.PUNCTUATION, '(');
        var args = [];
        while (!this.match(TokenType.PUNCTUATION, ')')) {
            args.push(this.parseExpression());
            if (this.match(TokenType.PUNCTUATION, ',')) {
                this.consume(TokenType.PUNCTUATION);
            }
        }
        this.consume(TokenType.PUNCTUATION, ')');
        return { type: 'CallExpression', callee: callee, arguments: args };
    };
    Parser.prototype.current = function () {
        return this.tokens[this.position];
    };
    Parser.prototype.match = function (type, value) {
        var token = this.current();
        if (token.type !== type)
            return false;
        if (value !== undefined && token.value !== value)
            return false;
        return true;
    };
    Parser.prototype.consume = function (type, value) {
        if (!this.match(type, value)) {
            throw new Error("Expected ".concat(type).concat(value ? " (".concat(value, ")") : '', ", got ").concat(this.current().type, " (").concat(this.current().value, ") ") +
                "at line ".concat(this.current().line, ", column ").concat(this.current().column));
        }
        return this.tokens[this.position++];
    };
    Parser.prototype.skipSemicolon = function () {
        if (this.match(TokenType.PUNCTUATION, ';')) {
            this.consume(TokenType.PUNCTUATION);
        }
    };
    return Parser;
}());
exports.Parser = Parser;
// ==================== 优化器 (Optimizer) ====================
var Optimizer = /** @class */ (function () {
    function Optimizer() {
    }
    Optimizer.prototype.optimize = function (node) {
        var _this = this;
        switch (node.type) {
            case 'Program': {
                return __assign(__assign({}, node), { body: node.body.map(function (s) { return _this.optimize(s); }) });
            }
            case 'BinaryExpression': {
                var left = this.optimize(node.left);
                var right = this.optimize(node.right);
                var folded = this.tryFoldBinary(node.operator, left, right);
                return folded ? folded : __assign(__assign({}, node), { left: left, right: right });
            }
            case 'UnaryExpression': {
                var argument = this.optimize(node.argument);
                var folded = this.tryFoldUnary(node.operator, argument);
                return folded ? folded : __assign(__assign({}, node), { argument: argument });
            }
            case 'ExpressionStatement': {
                return __assign(__assign({}, node), { expression: this.optimize(node.expression) });
            }
            case 'VariableDeclaration': {
                return __assign(__assign({}, node), { init: node.init ? this.optimize(node.init) : null });
            }
            case 'FunctionDeclaration': {
                return __assign(__assign({}, node), { body: this.optimizeBlock(node.body) });
            }
            case 'BlockStatement': {
                return this.optimizeBlock(node);
            }
            case 'IfStatement': {
                return __assign(__assign({}, node), { test: this.optimize(node.test), consequent: this.optimize(node.consequent), alternate: node.alternate ? this.optimize(node.alternate) : null });
            }
            case 'ReturnStatement': {
                return __assign(__assign({}, node), { argument: node.argument ? this.optimize(node.argument) : null });
            }
            case 'AssignmentExpression': {
                return __assign(__assign({}, node), { left: this.optimize(node.left), right: this.optimize(node.right) });
            }
            case 'CallExpression': {
                return __assign(__assign({}, node), { arguments: node.arguments.map(function (a) { return _this.optimize(a); }) });
            }
            case 'Identifier':
            case 'Literal':
                return node;
            default: {
                // 穷尽检查：如果 ASTNode 扩展了新类型但此处未处理，会在编译期报错
                var _exhaustive = node;
                return _exhaustive;
            }
        }
    };
    Optimizer.prototype.optimizeBlock = function (node) {
        var _this = this;
        return __assign(__assign({}, node), { body: node.body.map(function (s) { return _this.optimize(s); }) });
    };
    Optimizer.prototype.tryFoldBinary = function (operator, left, right) {
        if (left.type !== 'Literal' || right.type !== 'Literal') {
            return null;
        }
        var l = left.value;
        var r = right.value;
        if (typeof l === 'number' && typeof r === 'number') {
            var result = void 0;
            switch (operator) {
                case '+':
                    result = l + r;
                    break;
                case '-':
                    result = l - r;
                    break;
                case '*':
                    result = l * r;
                    break;
                case '/':
                    result = l / r;
                    break;
                case '==':
                    return { type: 'Literal', value: l == r };
                case '!=':
                    return { type: 'Literal', value: l != r };
                case '===':
                    return { type: 'Literal', value: l === r };
                case '!==':
                    return { type: 'Literal', value: l !== r };
                case '<':
                    return { type: 'Literal', value: l < r };
                case '>':
                    return { type: 'Literal', value: l > r };
                case '<=':
                    return { type: 'Literal', value: l <= r };
                case '>=':
                    return { type: 'Literal', value: l >= r };
                default:
                    return null;
            }
            return { type: 'Literal', value: result };
        }
        if (typeof l === 'string' && typeof r === 'string') {
            if (operator === '+') {
                return { type: 'Literal', value: l + r };
            }
            if (operator === '===' || operator === '==') {
                return { type: 'Literal', value: l === r };
            }
            if (operator === '!==' || operator === '!=') {
                return { type: 'Literal', value: l !== r };
            }
        }
        if (typeof l === 'boolean' && typeof r === 'boolean') {
            if (operator === '&&')
                return { type: 'Literal', value: l && r };
            if (operator === '||')
                return { type: 'Literal', value: l || r };
            if (operator === '===' || operator === '==')
                return { type: 'Literal', value: l === r };
            if (operator === '!==' || operator === '!=')
                return { type: 'Literal', value: l !== r };
        }
        return null;
    };
    Optimizer.prototype.tryFoldUnary = function (operator, argument) {
        if (argument.type !== 'Literal') {
            return null;
        }
        var value = argument.value;
        if (operator === '-' && typeof value === 'number') {
            return { type: 'Literal', value: -value };
        }
        if (operator === '!' && typeof value === 'boolean') {
            return { type: 'Literal', value: !value };
        }
        return null;
    };
    return Optimizer;
}());
exports.Optimizer = Optimizer;
// ==================== 代码生成器 (CodeGenerator) ====================
var CodeGenerator = /** @class */ (function () {
    function CodeGenerator() {
    }
    CodeGenerator.prototype.generate = function (node, indent) {
        var _this = this;
        if (indent === void 0) { indent = 0; }
        var prefix = '  '.repeat(indent);
        switch (node.type) {
            case 'Program': {
                return node.body.map(function (s) { return _this.generate(s, indent); }).join('\n');
            }
            case 'VariableDeclaration': {
                var initStr = node.init ? ' = ' + this.generate(node.init, indent) : '';
                return "".concat(prefix).concat(node.kind, " ").concat(node.id).concat(initStr, ";");
            }
            case 'FunctionDeclaration': {
                return "".concat(prefix, "function ").concat(node.name, "(").concat(node.params.join(', '), ") ").concat(this.generate(node.body, indent));
            }
            case 'BlockStatement': {
                if (node.body.length === 0) {
                    return '{}';
                }
                var inner = node.body.map(function (s) { return _this.generate(s, indent + 1); }).join('\n');
                return "{\n".concat(inner, "\n").concat(prefix, "}");
            }
            case 'IfStatement': {
                var code = "".concat(prefix, "if (").concat(this.generate(node.test, indent), ") ").concat(this.generate(node.consequent, indent));
                if (node.alternate) {
                    code += " else ".concat(this.generate(node.alternate, indent));
                }
                return code;
            }
            case 'ReturnStatement': {
                var argStr = node.argument ? ' ' + this.generate(node.argument, indent) : '';
                return "".concat(prefix, "return").concat(argStr, ";");
            }
            case 'ExpressionStatement': {
                return "".concat(prefix).concat(this.generate(node.expression, indent), ";");
            }
            case 'BinaryExpression': {
                return "".concat(this.generate(node.left, indent), " ").concat(node.operator, " ").concat(this.generate(node.right, indent));
            }
            case 'UnaryExpression': {
                return "".concat(node.operator).concat(this.generate(node.argument, indent));
            }
            case 'AssignmentExpression': {
                return "".concat(this.generate(node.left, indent), " ").concat(node.operator, " ").concat(this.generate(node.right, indent));
            }
            case 'CallExpression': {
                var argsStr = node.arguments.map(function (a) { return _this.generate(a, indent); }).join(', ');
                return "".concat(node.callee, "(").concat(argsStr, ")");
            }
            case 'Identifier': {
                return node.name;
            }
            case 'Literal': {
                if (typeof node.value === 'string') {
                    return "\"".concat(node.value, "\"");
                }
                if (typeof node.value === 'boolean') {
                    return String(node.value);
                }
                if (node.value === null) {
                    return 'null';
                }
                return String(node.value);
            }
            default: {
                var _exhaustive = node;
                return String(_exhaustive);
            }
        }
    };
    return CodeGenerator;
}());
exports.CodeGenerator = CodeGenerator;
// ==================== Demo ====================
function demo() {
    console.log('=== 编译器设计 ===\n');
    var source = "\n    // \u8FD9\u662F\u4E00\u4E2A\u884C\u6CE8\u91CA\n    /* \u8FD9\u662F\u4E00\u4E2A\n       \u5757\u6CE8\u91CA */\n    let x = 10;\n    let y = -5;\n    let msg = \"He said \\\"hi\\\"\";\n    let z = -y;\n\n    function add(a, b) {\n      return a + b;\n    }\n\n    if (x > y) {\n      let result = add(x, y);\n      result = result * 2;\n    } else if (x === y) {\n      result = 0;\n    } else {\n      result = -1;\n    }\n\n    let flag = !true;\n    let cond = (x > 0) && (y < 0);\n  ";
    console.log('源代码:');
    console.log(source);
    // 词法分析
    console.log('\n--- 词法分析 ---');
    var lexer = new Lexer(source);
    var tokens = lexer.tokenize();
    console.log('Tokens (前 15 个):', tokens.slice(0, 15).map(function (t) { return "".concat(t.type, "(").concat(JSON.stringify(t.value), ")"); }).join(', '), '...');
    // 语法分析
    console.log('\n--- 语法分析 ---');
    var parser = new Parser(tokens);
    var ast = parser.parse();
    console.log('AST 根节点:', ast.type);
    console.log('顶层语句数:', ast.body.length);
    // 优化
    console.log('\n--- 优化 ---');
    var optimizer = new Optimizer();
    var optimizedAST = optimizer.optimize(ast);
    console.log('优化完成');
    // 代码生成
    console.log('\n--- 代码生成 ---');
    var generator = new CodeGenerator();
    var output = generator.generate(optimizedAST);
    console.log('生成的代码:');
    console.log(output);
    // 简单表达式测试（含常量折叠与一元运算符）
    console.log('\n--- 表达式编译 ---');
    var exprSource = '-5 + 3 * 4';
    var exprLexer = new Lexer(exprSource);
    var exprParser = new Parser(exprLexer.tokenize());
    var exprAST = exprParser.parse();
    var exprOptimized = optimizer.optimize(exprAST);
    console.log("\u8868\u8FBE\u5F0F: ".concat(exprSource));
    console.log('生成的代码:', generator.generate(exprOptimized));
}
