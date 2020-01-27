import { EditorFactory, Editor } from "../EditorFactory";
import { Node, ObjectNode, ObjectNodeProperty, PrimitiveNode } from "../Node";
import * as React from "react";
import { Text, InputGroup, Switch, Checkbox } from "@blueprintjs/core";
import { observer } from "mobx-react";
import { action } from "mobx";

export class BooleanEditorFactory extends EditorFactory {
    public getEditors(node: Node, factory: EditorFactory): Editor[] {
        if (node.kind !== "primitive" || node.actualType.kind !== "boolean") {
            return [];
        }

        return [
            {
                isSingleLine: true,
                priority: 100,
                render: () => <BooleanEditor node={node} />
            }
        ];
    }
}

@observer
class BooleanEditor extends React.Component<{
    node: PrimitiveNode;
}> {
    @action.bound
    handleInputChange(event: React.FormEvent<HTMLInputElement>): void {
        this.props.node.value = event.currentTarget.checked;
    }

    render() {
        const { node } = this.props;
        return (
            <div className="component-BooleanEditor">
                <Checkbox
                    large
                    checked={node.value as boolean}
                    onChange={this.handleInputChange}
                />
            </div>
        );
    }
}
