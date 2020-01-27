import { sTypePackage, TypeSystem, namespace } from "@hediet/semantic-json";
import { NodeContainer, createDefaultNode } from "@hediet/semantic-json-react";
import { autorun, runInAction } from "mobx";

const r = sTypePackage
	.deserialize({
		$ns: {
			t: "json-types.org/basic-types",
			td: "json-types.org/type-definition",
			bla: "demo.org/bla",
		},
		$type: "td#TypeDefinitions",
		packageId: "bla",
		typeDefinitions: {
			ContactBook: {
				kind: "object",
				properties: {
					contacts: {
						type: {
							kind: "array",
							of: {
								kind: "union",
								of: ["bla#Contact", "bla#Address"],
							},
						},
						optional: false,
					},
				},
			},
			Contact: {
				kind: "object",
				properties: {
					kind: { type: { kind: "literal", value: "contact" } },
					firstName: { type: { kind: "string" } },
					lastName: { type: { kind: "string" } },
					type: {
						type: {
							kind: "union",
							of: [
								{ kind: "literal", value: "test1" },
								{ kind: "literal", value: "test2" },
							],
						},
					},
					phoneNumbers: {
						type: { kind: "array", of: { kind: "string" } },
					},
					address: {
						type: {
							kind: "union",
							of: ["bla#Address", "bla#AddressDictionary"],
						},
						optional: true,
					},
				},
			},

			AddressDictionary: {
				kind: "map",
				valueType: "bla#Address",
			},
			Address: {
				kind: "object",
				properties: {
					street: { type: { kind: "string" } },
					houseNumber: { type: { kind: "number" } },
					country: { type: { kind: "string" } },
				},
			},
		},
	})
	.unwrap();

const ts = new TypeSystem();

const d = sTypePackage.getType(ts);
//const pkg = ts.toPackage(ts.definedNamespaces()[0]);
//const val2 = sTypePackage.serialize(pkg);
//console.log(val2);

r.addToTypeSystem(ts);

export const val = new NodeContainer(
	//d
	ts.getType(namespace("demo.org/bla")("Contact"))!
);
runInAction(() => {
	val.node = createDefaultNode(val.expectedType);
});

autorun(() => {
	if (val.node) {
		console.log("cur value: ", val.node.toJson());
	}
});

export class Model {
	public readonly val = val;
}
