import React, { lazy, Suspense } from 'react';
import { LucideProps } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import { Circle } from 'lucide-react';

// Convert PascalCase icon name (from DB) to kebab-case (for dynamic imports)
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

interface DynamicIconProps extends Omit<LucideProps, 'ref'> {
  name: string | null | undefined;
}

const iconCache: Record<string, React.LazyExoticComponent<React.ComponentType<LucideProps>>> = {};

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  if (!name) return <Circle {...props} />;

  const kebabName = toKebabCase(name) as keyof typeof dynamicIconImports;

  if (!(kebabName in dynamicIconImports)) {
    return <Circle {...props} />;
  }

  if (!iconCache[kebabName]) {
    iconCache[kebabName] = lazy(dynamicIconImports[kebabName]);
  }

  const LazyIcon = iconCache[kebabName];

  return (
    <Suspense fallback={<Circle {...props} />}>
      <LazyIcon {...props} />
    </Suspense>
  );
};
