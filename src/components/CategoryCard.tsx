import { Link } from 'react-router-dom';
import { Category } from '@/data/types';
import { categoryIcons } from '@/data/icons';
import { getSubcategoriesByCategoryId } from '@/data/helpers';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = categoryIcons[category.icon];
  const subs = getSubcategoriesByCategoryId(category.id);

  return (
    <Link
      to={`/tools/${category.slug}`}
      className="group block rounded-xl border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
    >
      <div className={`mb-4 inline-flex items-center justify-center rounded-lg p-3 ${category.bgColorClass}`}>
        {Icon && <Icon className={`h-6 w-6 ${category.colorClass}`} />}
      </div>
      <h3 className="mb-1 text-lg font-semibold text-foreground">{category.name}</h3>
      <p className="mb-3 text-sm text-muted-foreground">{category.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {subs.slice(0, 3).map((sub) => (
          <span key={sub.id} className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
            {sub.name}
          </span>
        ))}
        {subs.length > 3 && (
          <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
            +{subs.length - 3}
          </span>
        )}
      </div>
    </Link>
  );
}
