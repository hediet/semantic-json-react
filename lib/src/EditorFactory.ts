import * as React from "react";
import { Node } from "./Node";
import { Context } from "./Context";

export interface Editor {
    /**
     * the higher the better
     */
    priority: number;
    readonly isSingleLine: boolean;
    render(): React.ReactElement;
}

export abstract class EditorFactory {
    public abstract getEditors(
        node: Node,
        factory: EditorFactory,
        context: Context
    ): Editor[];

    public getBestEditor(
        node: Node,
        factory: EditorFactory,
        context?: Context
    ): Editor | undefined {
        const e = this.getEditors(node, factory, context || new Context());
        e.sort((a, b) => b.priority - a.priority);

        return e[0];
    }
}

export class ComposableEditorFactory extends EditorFactory {
    constructor(private readonly factories: EditorFactory[]) {
        super();
    }

    public getEditors(
        node: Node,
        factory: EditorFactory,
        context: Context
    ): Editor[] {
        return new Array<Editor>().concat(
            ...this.factories.map(f => f.getEditors(node, factory, context))
        );
    }
}
