import { GenericParser } from "./parser/GenericParser";
import { Configuration } from "./parser/Configuration";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { generateNodeTypesMappingFile } from "./commands/treeSitterMapping";
import { outputAsJson } from "./commands/outputMetrics";

yargs(hideBin(process.argv))
    .command(
        "import-grammars",
        "(re-)import grammar expression types for supported languages",
        {},
        (argv) => {
            generateNodeTypesMappingFile();
        }
    )
    .command(
        "parse [sources-path]",
        "parse file or folders recursively by given path and calculate metrics",
        (cmdYargs) => {
            return cmdYargs
                .positional("sources-path", {
                    describe: "path to sources",
                })
                .option("output-path", {
                    alias: "o",
                    type: "string",
                    description: "Output file path",
                })
                .option("parse-dependencies", {
                    type: "boolean",
                    default: false,
                    description:
                        "Flag to enable dependency parsing (dependencies will be appended to the output file)",
                })
                .option("erase-from-path", {
                    type: "string",
                    description:
                        "Search and replace given string in all file names included in output file",
                    default: null,
                })
                .option("exclusions", {
                    alias: "e",
                    type: "string",
                    description: "Excluded folders",
                    default: ["node_modules", ".idea", "dist", "build", "out", "vendor"],
                })
                .option("compress", {
                    alias: "c",
                    type: "boolean",
                    description: "output .gz-zipped file",
                    default: false,
                })
                .demandOption(["sources-path", "output-path"]);
        },
        (argv) => {
            parseSourceCode(argv);
        }
    )
    .demandCommand()
    .strictCommands()
    .strictOptions()
    .parseSync();

function parseSourceCode(argv) {
    const configuration = new Configuration(
        argv["sources-path"],
        argv["output-path"],
        argv["parse-dependencies"],
        argv["erase-from-path"],
        argv["exclusions"],
        argv["compress"]
    );

    const parser = new GenericParser(configuration);
    const results = parser.calculateMetrics();

    outputAsJson(
        results.fileMetrics,
        results.couplingMetrics,
        configuration.outputPath,
        configuration.eraseFromPath
    );
}
