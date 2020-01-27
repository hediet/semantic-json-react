import { EditorFactory, Editor } from "../EditorFactory";
import {
    Node,
    ArrayNode,
    NodeContainer,
    MapNode,
    MapNodeProperty
} from "../Node";
import * as React from "react";
import classNames = require("classnames");
import { Checkbox, Button, Icon, InputGroup } from "@blueprintjs/core";
import { action, runInAction } from "mobx";
import { createDefaultNode } from "../createDefaultNode";
import { observer } from "mobx-react";
import { Context } from "../Context";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { UnionSelector } from "./UnionSelector";

export class MapEditorFactory extends EditorFactory {
    public getEditors(
        node: Node,
        factory: EditorFactory,
        context: Context
    ): Editor[] {
        if (node.kind !== "map") {
            return [];
        }

        return [
            {
                isSingleLine: false,
                priority: 100,
                render: () => (
                    <MapEditor
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
class MapEditor extends React.Component<{
    node: MapNode;
    factory: EditorFactory;
    context: Context;
}> {
    @action.bound
    addItem() {
        const p = new MapNodeProperty("", this.props.node.actualType.valueType);
        p.container.node = createDefaultNode(p.container.expectedType);
        this.props.node.properties.push(p);
    }

    render() {
        const { node, factory, context } = this.props;

        const children = node.properties.map((v, idx) => (
            <MapEditorItem
                key={idx}
                idx={idx}
                property={v}
                removeItem={() => node.properties.splice(idx, 1)}
                factory={factory}
                context={context}
            />
        ));

        return (
            <div className="component-MapEditor">
                <div className="part-header">
                    <Button minimal small onClick={this.addItem}>
                        <Icon icon={"plus"} iconSize={20} color="black" />
                    </Button>
                </div>
                <DragDropContext
                    onDragEnd={result => {
                        runInAction(() => {
                            if (!result.destination) {
                                return;
                            }

                            const items = this.props.node.properties.splice(
                                result.source.index,
                                1
                            );
                            this.props.node.properties.splice(
                                result.destination.index,
                                0,
                                ...items
                            );

                            result.source.index;
                        });
                    }}
                >
                    <Droppable droppableId="droppable">
                        {provided => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                {children}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        );
    }
}

@observer
class MapEditorItem extends React.Component<{
    property: MapNodeProperty;
    removeItem: () => void;
    factory: EditorFactory;
    context: Context;
    idx: number;
}> {
    @action.bound
    removeItem(): void {
        this.props.removeItem();
    }

    render() {
        const { property, factory, context, idx } = this.props;
        const container = property.container;
        const types = container.expectedType.resolveUnion();
        // assert types.length > 0

        const inner = container.node
            ? factory.getBestEditor(container.node, factory, context)
            : undefined;

        const innerEditor = inner && inner.render();

        const name = property.name;

        return (
            <Draggable draggableId={"" + idx} index={idx}>
                {provided => (
                    <div
                        className="component-MapEditorItem"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                    >
                        <div style={{ padding: 8 }}>
                            <InputGroup
                                value={name}
                                onChange={(
                                    c: React.FormEvent<HTMLInputElement>
                                ) =>
                                    runInAction("Update property name", () => {
                                        property.name = c.currentTarget.value;
                                    })
                                }
                            />
                        </div>
                        <div
                            className="part-side"
                            {...provided.dragHandleProps}
                        >
                            <Button small minimal onClick={this.removeItem}>
                                <Icon
                                    icon={"remove"}
                                    iconSize={18}
                                    color="white"
                                />
                            </Button>
                        </div>
                        <div className="part-main">
                            {types.length > 1 && (
                                <div className="part-type">
                                    <UnionSelector container={container}>
                                        {name => (
                                            <h3 className="type-name bp3-heading">
                                                {name}
                                            </h3>
                                        )}
                                    </UnionSelector>
                                </div>
                            )}
                            <div>{innerEditor}</div>
                        </div>
                    </div>
                )}
            </Draggable>
        );
    }
}
