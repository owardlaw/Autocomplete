import { Node } from '@tiptap/core';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { PluginKey } from '@tiptap/pm/state';
import { SuggestionOptions } from '@tiptap/suggestion';
export type HashtagOptions = {
    HTMLAttributes: Record<string, any>;
    renderLabel: (props: {
        options: HashtagOptions;
        node: ProseMirrorNode;
    }) => string;
    suggestion: Omit<SuggestionOptions, 'editor'>;
};
export declare const HashtagPluginKey: PluginKey<any>;
export declare const Hashtag: Node<HashtagOptions, any>;
