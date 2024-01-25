import { ExpressionMetricMapping } from "../helper/Model";
import { Metric, MetricResult, ParseFile } from "./Metric";
import Parser, { TreeCursor } from "tree-sitter";
import { getExpressionsByCategory } from "../helper/Helper";
import { debuglog, DebugLoggerFunction } from "node:util";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

/**
 * Counts the number of lines in a file, not counting for comments and empty lines.
 */
export class RealLinesOfCode implements Metric {
    private commentStatementsSet: Set<string>;

    /**
     * Constructs a new instance of {@link RealLinesOfCode}.
     * @param allNodeTypes List of all configured syntax node types.
     */
    constructor(allNodeTypes: ExpressionMetricMapping[]) {
        this.commentStatementsSet = new Set(
            getExpressionsByCategory(allNodeTypes, this.getName(), "comment")
        );
    }

    /**
     * Waling through the tree in order to find actual code lines.
     *
     * Uses a {@link TreeCursor} for this, as according to the
     * {@link https://tree-sitter.github.io/tree-sitter/using-parsers#walking-trees-with-tree-cursors|Tree-sitter documentation},
     * this is the most efficient way to traverse a syntax tree.
     * @param cursor A {@link TreeCursor} for the syntax tree.
     * @param realCodeLines A set in which the line numbers of the found code lines are stored.
     */
    walkTree(cursor: TreeCursor, realCodeLines = new Set<number>()) {
        // This is not a comment syntax node, so assume it includes "real code".
        if (!this.commentStatementsSet.has(cursor.currentNode.type)) {
            // Assume that first and last line of whatever kind of node this is, is a real code line.
            // This assumption should hold for all kinds of block/composed statements in (hopefully) all languages.
            realCodeLines.add(cursor.startPosition.row);
            // Adding the last line is not necessary, as every last line has to have some syntactical element,
            // which is again expressed as another syntax node.
        }
        // Recurse, depth-first
        if (cursor.gotoFirstChild()) {
            this.walkTree(cursor, realCodeLines);
        }
        if (cursor.gotoNextSibling()) {
            this.walkTree(cursor, realCodeLines);
        } else {
            // Completed searching this part of the tree, so go up now.
            cursor.gotoParent();
        }
        return realCodeLines;
    }

    async calculate(parseFile: ParseFile, tree: Parser.Tree): Promise<MetricResult> {
        let rloc = 0;
        const cursor = tree.walk();

        // Assume the root node is always some kind of program/file/compilation_unit stuff.
        // So if there are no child nodes, the file is empty.
        if (cursor.gotoFirstChild()) {
            const realCodeLines = this.walkTree(cursor);
            dlog("Included lines for rloc: ", realCodeLines);
            rloc = realCodeLines.size;
        }

        dlog(this.getName() + " - " + rloc);

        return {
            metricName: this.getName(),
            metricValue: rloc,
        };
    }

    getName(): string {
        return "real_lines_of_code";
    }
}
