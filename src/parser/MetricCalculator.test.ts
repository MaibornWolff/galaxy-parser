import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { calculateMetrics } from "./MetricCalculator.js";
import { mockConsole } from "../../test/metric-end-results/TestHelper.js";
import {
    ErrorFile,
    FileMetricResults,
    ParsedFile,
    SourceFile,
    UnsupportedFile,
} from "./metrics/Metric.js";
import { FileType, Language, languageToGrammar } from "./helper/Language.js";
import Parser = require("tree-sitter");
import { Classes } from "./metrics/Classes.js";
import { CommentLines } from "./metrics/CommentLines.js";
import { Complexity } from "./metrics/Complexity.js";
import { Functions } from "./metrics/Functions.js";
import { LinesOfCode } from "./metrics/LinesOfCode.js";
import { MaxNestingLevel } from "./metrics/MaxNestingLevel.js";
import { RealLinesOfCode } from "./metrics/RealLinesOfCode.js";
import * as LinesOfCodeRawText from "./metrics/LinesOfCodeRawText.js";
import fs from "fs/promises";

function initiateSpies(): void {
    vi.spyOn(Classes.prototype, "calculate").mockReturnValue({
        metricName: "classes",
        metricValue: 1,
    });
    vi.spyOn(CommentLines.prototype, "calculate").mockReturnValue({
        metricName: "comment_lines",
        metricValue: 2,
    });
    vi.spyOn(Complexity.prototype, "calculate").mockReturnValue({
        metricName: "complexity",
        metricValue: 3,
    });
    vi.spyOn(Functions.prototype, "calculate").mockReturnValue({
        metricName: "functions",
        metricValue: 4,
    });
    vi.spyOn(LinesOfCode.prototype, "calculate").mockReturnValue({
        metricName: "lines_of_code",
        metricValue: 5,
    });
    vi.spyOn(MaxNestingLevel.prototype, "calculate").mockReturnValue({
        metricName: "max_nesting_level",
        metricValue: 6,
    });
    vi.spyOn(RealLinesOfCode.prototype, "calculate").mockReturnValue({
        metricName: "real_lines_of_code",
        metricValue: 7,
    });
    vi.spyOn(LinesOfCodeRawText, "calculateLinesOfCodeRawText").mockReturnValue({
        metricName: "lines_of_code",
        metricValue: 8,
    });
}

function initiateErrorSpies(): void {
    vi.spyOn(Classes.prototype, "calculate").mockImplementation(() => {
        throw new Error("something went wrong when calculating classes metric");
    });
    vi.spyOn(CommentLines.prototype, "calculate").mockImplementation(() => {
        throw new Error("something went wrong when calculating commentLines metric");
    });
    vi.spyOn(Complexity.prototype, "calculate").mockImplementation(() => {
        throw new Error("something went wrong when calculating complexity metric");
    });
    vi.spyOn(Functions.prototype, "calculate").mockReturnValue({
        metricName: "functions",
        metricValue: 1,
    });
    vi.spyOn(LinesOfCode.prototype, "calculate").mockReturnValue({
        metricName: "lines_of_code",
        metricValue: 2,
    });
    vi.spyOn(MaxNestingLevel.prototype, "calculate").mockImplementation(() => {
        throw new Error("something went wrong when calculating maxNestingLevel metric");
    });
    vi.spyOn(RealLinesOfCode.prototype, "calculate").mockImplementation(() => {
        throw new Error("something went wrong when calculating realLinesOfCode metric");
    });
    vi.spyOn(LinesOfCodeRawText, "calculateLinesOfCodeRawText").mockReturnValue({
        metricName: "lines_of_code",
        metricValue: 8,
    });
}

describe("MetricCalculator.calculateMetrics()", () => {
    let parser: Parser;

    beforeAll(() => {
        parser = new Parser();
    });

    beforeEach(() => {
        vi.spyOn(fs, "readFile").mockReset();
        mockConsole();
    });

    it("should calculate all metrics of type source code for a python file", async () => {
        // given
        parser.setLanguage(languageToGrammar.get(Language.Python));
        const tree = parser.parse("sum(range(4))");
        const parsedFile = new ParsedFile("test.py", Language.Python, tree);
        const parsedFilePromise = parsedFile;

        initiateSpies();

        // when
        const [sourceFile, fileMetricResults] = await calculateMetrics(parsedFilePromise);

        // then
        expect(sourceFile).toEqual(parsedFile);
        expect(fileMetricResults).toMatchSnapshot();
    });

    it("should calculate lines of code and maximum nesting level for a JSON file", async () => {
        // given
        parser.setLanguage(languageToGrammar.get(Language.JSON));
        const tree = parser.parse('{ "a": { "b": "c" } }');
        const parsedFile = new ParsedFile("test.json", Language.JSON, tree);
        const parsedFilePromise = parsedFile;

        initiateSpies();

        // when
        const [sourceFile, fileMetricResults] = await calculateMetrics(parsedFilePromise);

        // then
        expect(sourceFile).toEqual(parsedFile);
        expect(fileMetricResults).toMatchSnapshot();
    });

    it("should calculate lines of code for a text file", async () => {
        // given
        const unsupportedFile = new UnsupportedFile("test.txt");
        const unsupportedFilePromise = unsupportedFile;

        initiateSpies();

        // when
        const [sourceFile, fileMetricResults] = await calculateMetrics(unsupportedFilePromise);

        // then
        expect(sourceFile).toEqual(unsupportedFile);
        expect(fileMetricResults).toMatchSnapshot();
    });

    it("should return an empty map of metrics when the source file is an error file", async () => {
        // given
        const errorFile = new ErrorFile(
            "/path/to/error/causing/file.js",
            new Error(
                "Root node of syntax tree for file /path/to/error/causing/file.js is undefined!",
            ),
        );

        const errorFilePromise = errorFile;

        // when
        const result = await calculateMetrics(errorFilePromise);

        // then
        const expectedResult: [SourceFile, FileMetricResults] = [
            errorFile,
            { fileType: FileType.Error, metricResults: [], metricErrors: [] },
        ];
        expect(result).toEqual(expectedResult);
    });

    it("should include an error object in the result when an error is thrown while calculating any metric on a source file", async () => {
        // given
        parser.setLanguage(languageToGrammar.get(Language.Python));
        const tree = parser.parse("sum(range(4))");
        const parsedFile = new ParsedFile("test.py", Language.Python, tree);
        const parsedFilePromise = parsedFile;

        initiateErrorSpies();

        // when
        const [sourceFile, fileMetricResults] = await calculateMetrics(parsedFilePromise);

        // then
        expect(sourceFile).toEqual(parsedFile);
        expect(fileMetricResults).toMatchSnapshot();
    });
});
