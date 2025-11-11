"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";

import TiptapEditor, { type TiptapEditorRef } from "@/components/tiptap-editor";
import { loadInitialContent } from "@/components/tiptap-editor/helpers/tiptap";
import { usePost } from "@/hooks/use-post";
import { Post } from "@/services/post";
import { AIAssistantLayout } from "@/components/ai-assistant/AIAssistantLayout";

type PostForm = Pick<Post, "title" | "content" | "readingTime">;

export default function EditFormWithAI() {
  const editorRef = useRef<TiptapEditorRef>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  
  const form = useForm<PostForm>({
    defaultValues: { title: "", content: "" },
  });
  const { debouncedSave, post } = usePost();

  const calculateReadingTime = useCallback(() => {
    const editor = editorRef.current;
    const wordCount = editor?.storage.characterCount.words() ?? 0;
    return Math.max(1, Math.ceil(wordCount / 150));
  }, []);

  // Load saved content only once when component mounts
  useEffect(() => {
    const editor = editorRef.current!;
    if (post && !hasLoaded && editor) {
      // Only load if there's actual content (not just the default Tiptap text)
      const hasRealContent = post.content && 
        !post.content.includes("What is Tiptap") && 
        post.content.trim().length > 50;
      
      if (hasRealContent) {
        loadInitialContent(editor, post.content);
        form.reset({ ...post });
      }
      setHasLoaded(true);
    }
  }, [post, hasLoaded, form]);

  // Auto-save on changes
  useEffect(() => {
    const subscription = form.watch((values, { type }) => {
      if (type === "change") {
        const readingTime = calculateReadingTime();
        
        // Only save if there's actual content
        const editor = editorRef.current;
        const wordCount = editor?.storage.characterCount.words() ?? 0;
        
        if (wordCount > 0) {
          debouncedSave({ ...values, readingTime });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [debouncedSave, calculateReadingTime]);

  return (
    <AIAssistantLayout editor={editorRef.current}>
      <div className="w-full h-full flex flex-col">
        <div className="w-full max-w-[56rem] mx-auto px-6 py-4 flex-1 flex flex-col gap-3">
          {/* Title */}
          <div className="flex-shrink-0">
            <label className="inline-block text-sm font-medium dark:text-white mb-1.5">
              Title
            </label>
            <Controller
              control={form.control}
              name="title"
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full px-4 py-2.5 shadow border border-[#d1d9e0] rounded-md bg-white dark:bg-[#0d1017] dark:text-white dark:border-[#3d444d] outline-none"
                  placeholder=""
                />
              )}
            />
          </div>
  
          {/* Content */}
          <div className="flex-1 flex flex-col min-h-0">
            <label className="inline-block text-sm font-medium dark:text-white mb-1.5">
              Content
            </label>
            <Controller
              control={form.control}
              name="content"
              render={({ field }) => (
                <TiptapEditor
                  ref={editorRef}
                  output="html"
                  content=""
                  minHeight={300}
                  maxHeight={650}
                  maxWidth={700}
                  onChange={field.onChange}
                  placeholder={{
                    paragraph: "Click a prompt button to generate your report...",
                    imageCaption: "",
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>
    </AIAssistantLayout>
  );
}