import Emoji from "@tiptap/extension-emoji";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TableKit as Table } from "@tiptap/extension-table";
import { TextAlign } from "@tiptap/extension-text-align";
import { Export } from '@tiptap-pro/extension-export';
import {
  TextStyle,
  Color,
  BackgroundColor,
} from "@tiptap/extension-text-style";
import { CharacterCount, Placeholder, Selection } from "@tiptap/extensions";
import { StarterKit } from "@tiptap/starter-kit";
import { CellAlign } from "./cell-align";
import { CodeBlock } from "./code-block";
import { ImageFigure } from "./image";
import { Link } from "./link";
import { Youtube } from "./youtube";
import { getEmojis } from "../helpers/emoji";

// AI Agent imports
import AiAgent, { AiAgentProvider } from '@tiptap-pro/extension-ai-agent';

type ExtensionConfig = {
  placeholder?: string | Record<string, string>;
};

export function createExtensions({ placeholder }: ExtensionConfig) {
  // Create AI Agent Provider
  const aiProvider = new AiAgentProvider({
    appId: process.env.NEXT_PUBLIC_TIPTAP_APP_ID || '',
    token: process.env.NEXT_PUBLIC_TIPTAP_TOKEN || '',
  });

  return [
    StarterKit.configure({
      horizontalRule: false,
      hardBreak: false,
      codeBlock: false,
      link: false,
    }),
    Placeholder.configure({
      includeChildren: true,
      showOnlyCurrent: true,
      showOnlyWhenEditable: true,
      placeholder: ({ node }) => {
        if (typeof placeholder === "string") return placeholder;
        if (placeholder && node.type.name in placeholder) {
          return placeholder[node.type.name];
        }
        return "Write something…";
      },
    }),
    CellAlign,
    TextAlign,
    Table.configure({ table: { cellMinWidth: 35, resizable: true } }),
    CharacterCount,
    Selection,
    Link,
    TextStyle,
    Color,
    BackgroundColor,
    Superscript,
    Subscript,
    ImageFigure,
    CodeBlock,
    Youtube,
    Emoji.configure({ emojis: getEmojis() }),
    
    // AI Agent extension (ONLY ONCE!)
    AiAgent.configure({
      provider: aiProvider,
    }),
    
    // Export extension
    Export.configure({
      appId: process.env.NEXT_PUBLIC_TIPTAP_APP_ID || '',
      token: process.env.NEXT_PUBLIC_TIPTAP_TOKEN || '',
    }),
  ];
}