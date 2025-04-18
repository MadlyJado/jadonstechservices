"use client";
import { useState, useEffect } from "react";
import { fetchComponentsByCategory } from "../lib/supabase";

interface ComponentOption {
  id: string;
  name: string;
  price: number;
}

interface DropdownProps {
  category: string;
  selectedComponent: ComponentOption | null;
  setSelectedComponent: (component: ComponentOption | null) => void;
  serviceFees: number;
}

const Dropdown: React.FC<DropdownProps> = ({ category, selectedComponent, setSelectedComponent, serviceFees }) => {
  const [options, setOptions] = useState<ComponentOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOptions() {
      setLoading(true);
      try {
        const data = await fetchComponentsByCategory(category);
        console.log(`Fetched components for ${category}:`, data);
        setOptions(data);
      } catch (error) {
        console.error(`Error fetching components for ${category}:`, error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }
    loadOptions();
  }, [category]);

  return (
    <div className="mb-4">
      <label className="block text-indigo-300 font-medium mb-2 text-center">{category.toUpperCase()}</label>
      <select
        className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200 text-center"
        value={selectedComponent ? selectedComponent.id : ""}
        onChange={(e) => {
          const selected = options.find((item) => String(item.id) === e.target.value);
          setSelectedComponent(selected || null);
        }}
      >
        <option value="">Select a {category}</option>
        {loading ? (
          <option>Loading...</option>
        ) : (
          options.map((option) => (
            <option key={option.id} value={String(option.id)}>
              {option.name} - ${option.price}
            </option>
          ))
        )}
      </select>
      {selectedComponent && (
        <p className="mt-2 text-sm text-indigo-400 text-center">
          Selected: {selectedComponent.name} - ${selectedComponent.price}* Added Service Fee: {serviceFees}
        </p>
      )}
    </div>
  );
};

export default Dropdown;
