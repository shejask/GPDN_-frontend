import React, { useImperativeHandle, forwardRef, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const RichTextEditor = forwardRef(({ initialContent = "", onChange }, ref) => {
  const quillRef = useRef();

  useImperativeHandle(ref, () => ({
    getContent: () => quillRef.current?.getEditor().root.innerHTML || "",
    setContent: (content) => {
      if (quillRef.current) {
        quillRef.current.getEditor().clipboard.dangerouslyPasteHTML(content || "");
      }
    },
  }));

  useEffect(() => {
    if (quillRef.current && initialContent) {
      quillRef.current.getEditor().clipboard.dangerouslyPasteHTML(initialContent);
    }
    // eslint-disable-next-line
  }, [initialContent]);

  return (
    <ReactQuill
      ref={quillRef}
      defaultValue={initialContent}
      theme="snow"
      onChange={onChange}
      style={{ minHeight: 120 }}
      modules={{
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote", "code-block"],
          ["link", "image"],
          ["clean"],
        ],
      }}
    />
  );
});

export default RichTextEditor;