import React = require("react");
import { NodeContainer } from "../Node";
import { Select } from "@blueprintjs/select";
import { Type } from "@hediet/semantic-json";
import { runInAction } from "mobx";
import { createDefaultNode } from "../createDefaultNode";
import { MenuItem, Button } from "@blueprintjs/core";
import { formatType } from "./utils";

export class UnionSelector extends React.Component<{
    container: NodeContainer;
    children: (currentTypeText: string) => React.ReactElement;
}> {
    render() {
        const container = this.props.container;

        const types = container.expectedType.resolveUnion();

        const TypeSelect = Select.ofType<Type>();
        const currentType = container.node
            ? container.node.sourceType
            : undefined;
        return (
            <TypeSelect
                filterable={false}
                popoverProps={{ minimal: true }}
                items={types}
                onItemSelect={item => {
                    runInAction("Set node type", () => {
                        container.node = createDefaultNode(item);
                    });
                }}
                itemRenderer={(type, { index, handleClick }) => (
                    <MenuItem
                        //active={modifiers.active}
                        //disabled={modifiers.disabled}
                        text={formatType(type).text}
                        label={formatType(type).subText}
                        key={index}
                        onClick={handleClick}
                    />
                )}
            >
                <Button minimal rightIcon="caret-down">
                    {this.props.children(
                        currentType
                            ? formatType(currentType).text
                            : "(undefined)"
                    )}
                </Button>
            </TypeSelect>
        );
    }
}
