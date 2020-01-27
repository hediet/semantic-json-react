import { EditorFactory, Editor } from "../EditorFactory";
import { Node, ArrayNode, NodeContainer } from "../Node";
import * as React from "react";
import classNames = require("classnames");
import { Checkbox, Button, Icon } from "@blueprintjs/core";
import { action, runInAction } from "mobx";
import { createDefaultNode } from "../createDefaultNode";
import { observer } from "mobx-react";
import { Context } from "../Context";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { UnionSelector } from "./UnionSelector";

export class ArrayEditorFactory extends EditorFactory {
    public getEditors(
        node: Node,
        factory: EditorFactory,
        context: Context
    ): Editor[] {
        if (node.kind !== "array") {
            return [];
        }

        return [
            {
                isSingleLine: false,
                priority: 100,
                render: () => (
                    <ArrayEditor
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
class ArrayEditor extends React.Component<{
    node: ArrayNode;
    factory: EditorFactory;
    context: Context;
}> {
    @action.bound
    addItem() {
        const c = new NodeContainer(this.props.node.actualType.itemType);
        c.node = createDefaultNode(c.expectedType);
        this.props.node.items.push(c);
    }

    render() {
        const { node, factory, context } = this.props;

        const children = node.items.map((v, idx) => (
            <ArrayEditorItem
                key={idx}
                idx={idx}
                container={v}
                removeItem={() => node.items.splice(idx, 1)}
                factory={factory}
                context={context}
            />
        ));

        return (
            <div className="component-ArrayEditor">
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

                            const items = this.props.node.items.splice(
                                result.source.index,
                                1
                            );
                            this.props.node.items.splice(
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
class ArrayEditorItem extends React.Component<{
    container: NodeContainer;
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
        const { container, factory, context, idx } = this.props;
        const types = container.expectedType.resolveUnion();
        // assert types.length > 0

        const inner = container.node
            ? factory.getBestEditor(container.node, factory, context)
            : undefined;

        const innerEditor = inner && inner.render();

        return (
            <Draggable draggableId={"" + idx} index={idx}>
                {provided => (
                    <div
                        className="component-ArrayEditorItem"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                    >
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
