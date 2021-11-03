import { QueryBuilder } from "../queries/QueryBuilder";
import fs from "fs";
import Parser from "tree-sitter";
import { grammars } from "../grammars";

export class Functions implements Metric {
    private functionsStatementSuperSet = [
        '"function" @function',
        '"func" @function',
        '"fun" @function',
        "(function) @function",
        "(function_declaration) @function",
        "(method_definition) @function.method",
    ];

    calculate(parseFile: ParseFile) {
        const treeSitterLanguage = grammars.get(parseFile.language);

        const parser = new Parser();
        parser.setLanguage(treeSitterLanguage);

        const sourceCode = fs.readFileSync(parseFile.filePath).toString();
        const tree = parser.parse(sourceCode);

        const queryBuilder = new QueryBuilder(treeSitterLanguage, tree);
        queryBuilder.setStatements(this.functionsStatementSuperSet);

        const query = queryBuilder.build();
        const matches = query.matches(tree.rootNode);

        console.log("functions - " + matches.length);
    }
}
