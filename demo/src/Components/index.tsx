import React = require("react");
import { Model } from "../Model/Model";
import { observer } from "mobx-react";
import classnames = require("classnames");
import {
	ComposableEditorFactory,
	defaultFactories,
} from "@hediet/semantic-json-react";

@observer
export class GUI extends React.Component<{ model: Model }> {
	render() {
		const m = this.props.model;
		const container = m.val;
		const f = new ComposableEditorFactory(defaultFactories);
		const editor = f.getBestEditor(container.node!, f)!;

		if (!container) {
			return <div />;
		}
		return <div className="component-GUI">{editor.render()}</div>;
	}
}
