import { EditorFactory, Editor } from "../EditorFactory";
import { Node, ObjectNode, ObjectNodeProperty } from "../Node";
import * as React from "react";
import classNames = require("classnames");
import { Checkbox, Switch } from "@blueprintjs/core";
import { action, runInAction } from "mobx";
import { createDefaultNode } from "../createDefaultNode";
import { observer } from "mobx-react";
import { Context, objectContext } from "../Context";
import { Select } from "@blueprintjs/select";
import { Type } from "@hediet/semantic-json";
import { camelCaseToCapitalized } from "./utils";
import { UnionSelector } from "./UnionSelector";

export class ObjectEditorFactory extends EditorFactory {
    public getEditors(
        node: Node,
        factory: EditorFactory,
        context: Context
    ): Editor[] {
        if (node.kind !== "object") {
            return [];
        }

        return [
            {
                isSingleLine: false,
                priority: 100,
                render: () => (
                    <ObjectEditor
                        node={node}
                        factory={factory}
                        context={context}
                    />
                )
            }
        ];
    }
}

@observer
class ObjectEditor extends React.Component<{
    node: ObjectNode;
    factory: EditorFactory;
    context: Context;
}> {
    render() {
        const { node, factory, context } = this.props;
        return (
            <div
                className={classNames(
                    "component-ObjectEditor",
                    `level-${context.get(objectContext).depth}`
                )}
            >
                {Object.values(node.properties)
                    .filter(
                        p =>
                            p.propertyInfo.optional ||
                            p.propertyInfo.type.resolveDefinition().kind !==
                                "literal"
                    )
                    .map((v, idx) => (
                        <ObjectPropertyEditor
                            key={idx}
                            property={v}
                            factory={factory}
                            context={context}
                        />
                    ))}
            </div>
        );
    }
}

@observer
class ObjectPropertyEditor extends React.Component<{
    property: ObjectNodeProperty;
    factory: EditorFactory;
    context: Context;
}> {
    @action.bound
    handleChange(event: React.FormEvent<HTMLInputElement>): void {
        const c = this.props.property.container;
        if (event.currentTarget.checked) {
            c.node = createDefaultNode(c.expectedType);
        } else {
            c.node = undefined;
        }
    }

    render() {
        const { property: p, factory, context } = this.props;
        const types = p.container.expectedType.resolveUnion();
        // assert types.length > 0

        const inner = p.container.node
            ? factory.getBestEditor(
                  p.container.node,
                  factory,
                  context.withUpdated(objectContext, c => c.increaseDepth())
              )
            : undefined;

        const singleLine =
            //!p.propertyInfo.optional &&
            inner && inner.isSingleLine && types.length === 1;
        const innerEditor = inner && inner.render();
        const TypeSelect = Select.ofType<Type>();
        const currentType = p.container.node
            ? p.container.node.sourceType
            : undefined;

        const headerContent = (
            <>
                <div style={{ flex: 1 }}>
                    {singleLine ? innerEditor : undefined}
                </div>

                {types.length > 1 && (
                    <div style={{ paddingRight: 16 }}>
                        <UnionSelector container={p.container}>
                            {name => (
                                <h3 className="type-name bp3-heading">
                                    {name}
                                </h3>
                            )}
                        </UnionSelector>
                    </div>
                )}

                {p.propertyInfo.optional && (
                    <div style={{ paddingRight: 16 }}>
                        <Switch
                            style={{ margin: 0 }}
                            checked={!!p.container.node}
                            innerLabel={
                                p.container.node ? "Defined" : "Undefined"
                            }
                            large
                            onChange={this.handleChange}
                        />
                    </div>
                )}
            </>
        );
        const mainContent = singleLine ? undefined : innerEditor;

        return (
            <div className={classNames("component-ObjectPropertyEditor")}>
                <div className="part-header">
                    <div className="part-name">
                        <h5 className="bp3-heading">
                            {camelCaseToCapitalized(p.name)}
                        </h5>
                    </div>
                    {headerContent && (
                        <div className="part-headerContent">
                            {headerContent}
                        </div>
                    )}
                </div>
                {mainContent && <div className="part-main">{mainContent}</div>}
            </div>
        );
    }
}
