import { EditorFactory, Editor } from "../EditorFactory";
import { Node, ObjectNode, ObjectNodeProperty, PrimitiveNode } from "../Node";
import * as React from "react";
import { Text, InputGroup, NumericInput } from "@blueprintjs/core";
import { observer } from "mobx-react";
import { action } from "mobx";

export class NumberEditorFactory extends EditorFactory {
	public getEditors(node: Node, factory: EditorFactory): Editor[] {
		if (node.kind !== "primitive" || node.actualType.kind !== "number") {
			return [];
		}

		return [
			{
				isSingleLine: true,
				priority: 100,
				render: () => <NumberEditor node={node} />,
			},
		];
	}
}

@observer
class NumberEditor extends React.Component<{
	node: PrimitiveNode;
}> {
	@action.bound
	handleInputChange(value: number): void {
		this.props.node.value = value;
	}

	render() {
		const { node } = this.props;
		return (
			<div className="component-NumberEditor">
				<NumericInput
					value={node.value as number}
					onValueChange={this.handleInputChange}
				/>
			</div>
		);
	}
}
