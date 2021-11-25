import { AbstractCollector } from "./AbstractCollector";
import { PHPCollector } from "./PHPCollector";
import { TreeParser } from "../../helper/TreeParser";
import { CSharpCollector } from "./CSharpCollector";

export class Factory {
    private collectors = new Map<string, AbstractCollector>();

    constructor() {
        this.collectors.set("cs", new CSharpCollector());
        this.collectors.set("php", new PHPCollector());
    }

    getCollector(parseFile: ParseFile): AbstractCollector | undefined {
        return this.collectors.get(parseFile.language);
    }
}
