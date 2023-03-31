import { Node, mergeAttributes } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import Suggestion from '@tiptap/suggestion';

const ReferencePluginKey = new PluginKey('Reference');
const Reference = Node.create({
    name: 'Reference',
    addOptions() {
        return {
            HTMLAttributes: {},
            renderLabel({ options, node }) {
                var _a;
                return `${options.suggestion.char}${(_a = node.attrs.label) !== null && _a !== void 0 ? _a : node.attrs.id}`;
            },
            suggestion: {
                char: '<>',
                pluginKey: ReferencePluginKey,
                allowSpaces: true,
                command: ({ editor, range, props }) => {
                    var _a, _b;
                    const nodeAfter = editor.view.state.selection.$to.nodeAfter;
                    const overrideSpace = (_a = nodeAfter === null || nodeAfter === void 0 ? void 0 : nodeAfter.text) === null || _a === void 0 ? void 0 : _a.startsWith(' ');
                    if (overrideSpace) {
                        range.to += 1;
                    }
                    editor
                        .chain()
                        .focus()
                        .insertContentAt(range, [
                        {
                            type: this.name,
                            attrs: props,
                        },
                        {
                            type: 'text',
                            text: ' ',
                        },
                    ])
                        .run();
                    (_b = window.getSelection()) === null || _b === void 0 ? void 0 : _b.collapseToEnd();
                },
                allow: ({ state, range }) => {
                    const $from = state.doc.resolve(range.from);
                    const type = state.schema.nodes[this.name];
                    const allow = !!$from.parent.type.contentMatch.matchType(type);
                    return allow;
                },
            },
        };
    },
    group: 'inline',
    inline: true,
    selectable: false,
    atom: true,
    addAttributes() {
        return {
            id: {
                default: null,
                parseHTML: element => element.getAttribute('data-id'),
                renderHTML: attributes => {
                    if (!attributes.id) {
                        return {};
                    }
                    return {
                        'data-id': attributes.id,
                    };
                },
            },
            label: {
                default: null,
                parseHTML: element => element.getAttribute('data-label'),
                renderHTML: attributes => {
                    if (!attributes.label) {
                        return {};
                    }
                    return {
                        'data-label': attributes.label,
                    };
                },
            },
        };
    },
    parseHTML() {
        return [
            {
                tag: `span[data-type="${this.name}"]`,
            },
        ];
    },
    renderHTML({ node, HTMLAttributes }) {
        return [
            'span',
            mergeAttributes({ 'data-type': this.name }, this.options.HTMLAttributes, HTMLAttributes),
            this.options.renderLabel({
                options: this.options,
                node,
            }),
        ];
    },
    renderText({ node }) {
        return this.options.renderLabel({
            options: this.options,
            node,
        });
    },
    addKeyboardShortcuts() {
        return {
            Backspace: () => this.editor.commands.command(({ tr, state }) => {
                let isReference = false;
                const { selection } = state;
                const { empty, anchor } = selection;
                if (!empty) {
                    return false;
                }
                state.doc.nodesBetween(anchor - 1, anchor, (node, pos) => {
                    if (node.type.name === this.name) {
                        isReference = true;
                        tr.insertText(this.options.suggestion.char || '', pos, pos + node.nodeSize);
                        return false;
                    }
                });
                return isReference;
            }),
        };
    },
    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
            }),
        ];
    },
});

export { Reference, ReferencePluginKey, Reference as default };
