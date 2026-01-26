"use client";

import { ReactNode, useRef, isValidElement } from "react";
import { CopyCodeButton } from "./copy-code-button";

interface PreProps {
  children?: ReactNode;
}

function extractTextFromChildren(children: ReactNode): string {
  if (typeof children === "string") {
    return children;
  }

  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join("");
  }

  if (isValidElement(children)) {
    const props = children.props as { children?: ReactNode };
    return extractTextFromChildren(props.children);
  }

  return "";
}

function CodeBlock({ children, ...props }: PreProps) {
  const preRef = useRef<HTMLPreElement>(null);

  // Extract the code text from children (typically a <code> element)
  const codeText = extractTextFromChildren(children).trim();

  return (
    <div className="code-block-wrapper relative group">
      <pre ref={preRef} {...props}>
        {children}
      </pre>
      <CopyCodeButton code={codeText} />
    </div>
  );
}

export const mdxComponents = {
  pre: CodeBlock,
};
