// data/products.ts
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
  }
  
  export const products: Product[] = [
    {
      id: '1',
      name: 'Gaming PC',
      description: 'A high performance gaming computer with the latest graphics and processing power.',
      price: 1500,
      image: '/images/gaming-pc.jpg',
    },
    {
      id: '2',
      name: 'Professional Workstation',
      description: 'A powerful workstation designed for professionals in video editing, design, and more.',
      price: 2000,
      image: '/images/workstation.jpg',
    },
    // Add additional products as needed
  ];
  