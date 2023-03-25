import { Node } from '@tiptap/core';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { PluginKey } from '@tiptap/pm/state';
import { SuggestionOptions } from '@tiptap/suggestion';
export type ReferenceOptions = {
    HTMLAttributes: Record<string, any>;
    renderLabel: (props: {
        options: ReferenceOptions;
        node: ProseMirrorNode;
    }) => string;
    suggestion: Omit<SuggestionOptions, 'editor'>;
};
export declare const ReferencePluginKey: PluginKey<any>;
export declare const Reference: Node<ReferenceOptions, any>;
