import { Type } from "@hediet/semantic-json";

export function formatType(nodeType: Type): { text: string; subText: string } {
    switch (nodeType.kind) {
        case "string":
            return { text: "String", subText: "" };
        case "boolean":
            return { text: "Boolean", subText: "" };
        case "number":
            return { text: "Number", subText: "" };
        case "literal":
            return { text: nodeType.value.toString(), subText: "Literal" };
        case "array":
            return {
                text: formatType(nodeType.itemType).text,
                subText: "Array"
            };
        case "object":
            return { text: "Object", subText: "" };

        case "map":
            return null!;

        case "union":
            return null!;

        case "definition":
            return {
                text: nodeType.namespacedName.name,
                subText: nodeType.namespacedName.namespace
            };

        case "any":
        case "intersection":
        case "map":
        case "custom":
            return null!;
    }
}

export function camelCaseToCapitalized(camelCasedWord: string) {
    return camelCasedWord
        .replace(/[a-z][A-Z]/g, x => x[0] + " " + x[1].toUpperCase())
        .replace(/^./, x => x.toUpperCase());
}
