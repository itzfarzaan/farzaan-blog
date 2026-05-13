import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

const schema = {
    ...defaultSchema,
    attributes: {
        ...defaultSchema.attributes,
        code: [...(defaultSchema.attributes?.code || []), 'className'],
        span: [...(defaultSchema.attributes?.span || []), 'className'],
        img: [...(defaultSchema.attributes?.img || []), 'src', 'alt', 'title'],
        a: [...(defaultSchema.attributes?.a || []), 'href', 'target', 'rel'],
    },
};

export default function MarkdownArticle({ content }) {
    return (
        <div className="article-body">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[
                    rehypeHighlight,
                    [rehypeSanitize, schema],
                ]}
                components={{
                    a: ({ node, ...props }) => (
                        <a {...props} target="_blank" rel="noreferrer" />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
