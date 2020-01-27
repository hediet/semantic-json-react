import { EditorFactory, Editor } from "../EditorFactory";
import { Node, ObjectNode, ObjectNodeProperty, PrimitiveNode } from "../Node";
import * as React from "react";
import { Text, InputGroup } from "@blueprintjs/core";
import { observer } from "mobx-react";
import { action } from "mobx";

export class StringEditorFactory extends EditorFactory {
    public getEditors(node: Node, factory: EditorFactory): Editor[] {
        if (node.kind !== "primitive" || node.actualType.kind !== "string") {
            return [];
        }

        return [
            {
                isSingleLine: true,
                priority: 100,
                render: () => <StringEditor node={node} />
            }
        ];
    }
}

@observer
class StringEditor extends React.Component<{
    node: PrimitiveNode;
}> {
    @action.bound
    handleInputChange(event: React.FormEvent<HTMLInputElement>): void {
        this.props.node.value = event.currentTarget.value;
    }

    render() {
        const { node } = this.props;
        return (
            <div className="component-StringEditor">
                <InputGroup
                    value={node.value + ""}
                    onChange={this.handleInputChange}
                />
            </div>
        );
    }
}
