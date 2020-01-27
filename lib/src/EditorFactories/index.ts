import { ObjectEditorFactory } from "./ObjectEditorFactory";
import { StringEditorFactory } from "./StringEditorFactory";
import { ArrayEditorFactory } from "./ArrayEditorFactory";
import { NumberEditorFactory } from "./NumberEditorFactory";
import { MapEditorFactory } from "./MapEditorFactory";
import { BooleanEditorFactory } from "./BooleanEditorFactory";

export const defaultFactories = [
    new ObjectEditorFactory(),
    new ArrayEditorFactory(),
    new MapEditorFactory(),
    new StringEditorFactory(),
    new NumberEditorFactory(),
    new BooleanEditorFactory()
];
