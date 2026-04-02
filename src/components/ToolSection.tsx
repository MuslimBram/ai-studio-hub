import { ToolCard } from './ToolCard';
import { Tool } from '@/data/types';

interface ToolSectionProps {
  title: string;
  tools: Tool[];
  viewAllLink?: string;
}

export function ToolSection({ title, tools }: ToolSectionProps) {
  if (tools.length === 0) return null;

  return (
    <section className="py-8">
      <h2 className="mb-6 text-2xl font-bold text-foreground">{title}</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}
