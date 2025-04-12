// components/ComponentCard.tsx
'use client';

interface ComponentCardProps {
  type: string;
  component: {
    name: string;
    price: number;
    id: string;
  };
  variant?: 'user' | 'admin';
}

export default function ComponentCard({ type, component, variant = 'user' }: ComponentCardProps) {
  if (variant === 'user') {
    return (
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex justify-between">
          <span className="font-medium capitalize">{type}:</span>
          <span className="text-gray-600">${(component.price / 100).toFixed(2)}</span>
        </div>
        <p className="text-sm text-gray-600">{component.name}</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 p-4 rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-white capitalize">{type}</h4>
          <p className="text-sm text-white/80">{component.name}</p>
        </div>
        <span className="text-white bg-white/20 px-2 py-1 rounded text-sm">
          ${(component.price / 100).toFixed(2)}
        </span>
      </div>
      <p className="text-xs text-white/60 mt-2">ID: {component.id}</p>
    </div>
  );
}