import { describe, expect, it } from "vitest";
import { type Relationship } from "../metric.js";
import { type CallExpression } from "../../resolver/call-expressions/abstract-collector.js";
import { type Accessor } from "../../resolver/accessors/abstract-collector.js";
import { getAdditionalRelationships } from "./call-expression-resolver.js";

describe("CallExpressionResolver", () => {
    describe("resolves call expressions and retrieves additional and transitive relationships", () => {
        it("when call expressions with save calls, public accessors and the right dependencies are given", () => {
            const firstItem: Relationship = {
                fromFQTN: "FirstItemNamespace.FirstItem",
                fromFile: "FirstItem",
                toFile: "SecondItem",
                toFQTN: "SecondItemNamespace.SecondItem",
                fromClassName: "FirstItem",
                toClassName: "SecondItem",
                usageType: "usage",
            };

            const secondItem: Relationship = {
                fromFQTN: "SecondItemNamespace.SecondItem",
                fromFile: "SecondItem",
                toFile: "ThirdItem",
                toFQTN: "ThirdItemNamespace.ThirdItem",
                fromClassName: "FirstItem",
                toClassName: "ThirdItem",
                usageType: "usage",
            };

            const thirdItem: Relationship = {
                fromFQTN: "ThirdItemNamespace.ThirdItem",
                fromFile: "ThirdItem",
                toFile: "FourthItem",
                toFQTN: "FourthItemNamespace.FourthItem",
                fromClassName: "FirstItem",
                toClassName: "FourthItem",
                usageType: "usage",
            };

            const dependencyTree = new Map<string, Relationship[]>();
            dependencyTree.set(firstItem.fromFile, [firstItem]);
            dependencyTree.set(secondItem.fromFile, [secondItem]);
            dependencyTree.set(thirdItem.fromFile, [thirdItem]);
            dependencyTree.set(thirdItem.toFile, []);

            const callExpression1: CallExpression = {
                name: "myVariable?.UnknownAccessor?.AccessorInSecondItem?.AccessorInThirdItem?",
                namespaceDelimiter: ".",
                variableNameIncluded: true,
            };

            const callExpression2: CallExpression = {
                name: "myVariable.AccessorInSecondItem",
                namespaceDelimiter: ".",
                variableNameIncluded: true,
            };

            const unresolvedCallExpressions = new Map<string, CallExpression[]>();
            unresolvedCallExpressions.set(firstItem.fromFile, [callExpression1, callExpression2]);

            const accessor1: Accessor = {
                filePath: "SecondItem",
                name: "AccessorInSecondItem",
                fromTypes: [
                    {
                        namespace: "SecondItemNamespace",
                        sourceFile: "SecondItem",
                        typeName: "SecondItem",
                        classType: "class",
                        namespaceDelimiter: ".",
                        implementedFrom: [],
                    },
                ],
                returnType: "ThirdItem",
            };

            const accessor2: Accessor = {
                filePath: "ThirdItem",
                name: "AccessorInThirdItem",
                fromTypes: [
                    {
                        namespace: "ThirdItemNamespace",
                        sourceFile: "ThirdItem",
                        typeName: "ThirdItem",
                        classType: "class",
                        namespaceDelimiter: ".",
                        implementedFrom: [],
                    },
                ],
                returnType: "FourthItem",
            };

            const publicAccessors = new Map<string, Accessor[]>();
            publicAccessors.set(accessor1.name, [accessor1]);
            publicAccessors.set(accessor2.name, [accessor2]);

            const additionalRelationships = getAdditionalRelationships(
                dependencyTree,
                unresolvedCallExpressions,
                publicAccessors,
                new Set<string>(),
            );

            expect(additionalRelationships).toMatchSnapshot();
        });
    });
});
