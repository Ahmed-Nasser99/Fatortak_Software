import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface MarkdownRendererProps {
  content: string;
  isRTL?: boolean;
  className?: string;
}

const CurrencyCell: React.FC<{ value: string }> = ({ value }) => {
  const cleaned = value.replace(/[, ]+/g, "");
  const num = Number(cleaned);

  if (Number.isFinite(num)) {
    const hasDecimals = /\.\d+/.test(value);
    return (
      <div className="text-right font-mono font-semibold whitespace-nowrap">
        {num.toLocaleString(undefined, {
          minimumFractionDigits: hasDecimals ? 2 : 0,
          maximumFractionDigits: 2,
        })}
      </div>
    );
  }
  return <div>{value}</div>;
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  isRTL = false,
  className = "",
}) => {
  const components = {
    table: ({ node, ...props }: any) => (
      <div className="overflow-x-auto my-4">
        <table
          {...props}
          className="w-full text-sm rounded-lg border-collapse border border-purple-200/30 dark:border-purple-700/30"
        />
      </div>
    ),
    thead: ({ node, ...props }: any) => (
      <thead
        {...props}
        className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-800/20"
      />
    ),
    th: ({ node, ...props }: any) => (
      <th
        {...props}
        className="px-4 py-2 font-semibold text-gray-900 dark:text-white text-sm border-b border-purple-200/30"
      />
    ),
    td: ({ node, children, ...props }: any) => {
      const text =
        typeof children === "string"
          ? children
          : children?.[0]?.props?.children ?? "";
      const cleaned = String(text).replace(/[, ]+/g, "");

      return /^\d+(\.\d+)?$/.test(cleaned) ? (
        <td
          {...props}
          className="px-4 py-3 border-b border-purple-100/40 text-right"
        >
          <CurrencyCell value={String(text)} />
        </td>
      ) : (
        <td {...props} className="px-4 py-3 border-b border-purple-100/40">
          {children}
        </td>
      );
    },
    p: ({ node, ...props }: any) => (
      <p
        {...props}
        className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2"
      />
    ),
    code: ({ inline, ...props }: any) =>
      inline ? (
        <code
          {...props}
          className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono"
        />
      ) : (
        <pre
          {...props}
          className="p-3 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto text-sm"
        />
      ),
    strong: ({ node, ...props }: any) => (
      <strong {...props} className="font-bold" />
    ),
  };

  return (
    <div
      className={`prose max-w-full ${className} ${isRTL ? "rtl" : ""}`}
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        lineHeight: 1.45,
        ...(isRTL ? { direction: "rtl", textAlign: "right" } : {}),
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
