import { Node, PrimitiveNode, ArrayNode, ObjectNode, MapNode } from "./Node";
import { Type } from "@hediet/semantic-json";

export function createDefaultNode(sourceType: Type): Node {
	const nodeType = sourceType.resolveDefinition();

	switch (nodeType.kind) {
		case "string":
			return new PrimitiveNode(sourceType, nodeType, "");
		case "boolean":
			return new PrimitiveNode(sourceType, nodeType, false);
		case "number":
			return new PrimitiveNode(sourceType, nodeType, 0);
		case "literal":
			return new PrimitiveNode(sourceType, nodeType, nodeType.value);
		case "array":
			return new ArrayNode(sourceType, nodeType);
		case "object":
			const n = new ObjectNode(sourceType, nodeType);
			for (const prop of Object.values(n.properties)) {
				if (!prop.propertyInfo.optional) {
					prop.container.node = createDefaultNode(
						prop.propertyInfo.type
					);
				}
			}
			return n;

		case "map":
			return new MapNode(sourceType, nodeType);

		case "union":
			const first = nodeType.resolveUnion()[0];
			return createDefaultNode(first);
		case "any":
		case "intersection":
		case "map":
		case "custom":
			return null!;
	}
}
