import { observable } from "mobx";
import {
    Type,
    ObjectType,
    MapType,
    LiteralType,
    BooleanType,
    NumberType,
    ArrayType,
    StringType,
    ObjectProperty
} from "@hediet/semantic-json";

export class NodeContainer<TType extends Type = Type> {
    public static globalId = 0;
    public readonly id = NodeContainer.globalId++;

    constructor(public readonly expectedType: TType) {}

    /**
     * Is undefined if no value is set.
     */
    @observable public node: Node | undefined = undefined;
}

export type Node = ObjectNode | ArrayNode | PrimitiveNode | MapNode;

export abstract class BaseNode<TType extends Type = Type> {
    constructor(
        public readonly sourceType: Type,
        public readonly actualType: TType
    ) {
        if (sourceType.resolveDefinition() !== actualType) {
            throw new Error("Invalid source type");
        }
    }

    public abstract toJson(): unknown;
}

export class ObjectNode extends BaseNode<ObjectType> {
    public readonly kind = "object";

    @observable
    public readonly properties: Record<string, ObjectNodeProperty> = {};

    constructor(sourceType: Type, actualType: ObjectType) {
        super(sourceType, actualType);

        for (const p of Object.values(actualType.properties)) {
            this.properties[p.name] = new ObjectNodeProperty(p);
        }
    }

    public toJson(): unknown {
        const result: Record<string, unknown> = {};
        for (const [name, val] of Object.entries(this.properties)) {
            if (!val.container.node) {
                continue;
            }
            result[name] = val.container.node.toJson();
        }
        return result;
    }
}

export class ObjectNodeProperty {
    public readonly container: NodeContainer;

    public get name(): string {
        return this.propertyInfo.name;
    }

    constructor(public readonly propertyInfo: ObjectProperty) {
        this.container = new NodeContainer(propertyInfo.type);
    }
}

export class MapNode extends BaseNode<MapType> {
    public readonly kind = "map";

    @observable
    public readonly properties: MapNodeProperty[] = [];

    constructor(sourceType: Type, actualType: MapType) {
        super(sourceType, actualType);
    }

    public toJson(): unknown {
        const result: Record<string, unknown> = {};
        for (const val of this.properties) {
            if (!val.container || !val.container.node) {
                continue;
            }
            result[val.name] = val.container.node.toJson();
        }
        return result;
    }
}

export class MapNodeProperty {
    public readonly container: NodeContainer;

    @observable public name: string;

    constructor(name: string, public readonly expectedType: Type) {
        this.name = name;
        this.container = new NodeContainer(expectedType);
    }
}

export class ArrayNode extends BaseNode<ArrayType> {
    public readonly kind = "array";

    @observable
    public readonly items = new Array<NodeContainer>();

    public toJson(): unknown {
        return this.items.map(i => (i.node ? i.node.toJson() : null));
    }
}

export type Primitive = null | boolean | string | number;

export class PrimitiveNode extends BaseNode<
    StringType | LiteralType | BooleanType | NumberType
> {
    public readonly kind = "primitive";

    @observable value: Primitive;

    public get type(): "null" | "boolean" | "string" | "number" {
        const t = typeof this.value;
        if (t === "object" && !this.value) {
            return "null";
        }
        if (t === "boolean" || t === "string" || t === "number") {
            return t;
        }
        throw new Error(`Invalid type "${t}"!`);
    }

    constructor(
        sourceType: Type,
        actualType: StringType | LiteralType | BooleanType | NumberType,
        value: Primitive
    ) {
        super(sourceType, actualType);
        this.value = value;
    }

    public toJson(): unknown {
        return this.value;
    }
}
