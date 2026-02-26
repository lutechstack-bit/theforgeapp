 import React from 'react';
 import { Badge } from '@/components/ui/badge';
 
const partners = [
  {
    id: 'sony',
    name: 'Sony',
    logo: '/images/brands/sony.png?v=2',
    discount: 'Up to 25% off',
    description: 'Cameras, lenses & accessories',
  },
  {
    id: 'digitek',
    name: 'Digitek',
    logo: '/images/brands/digitek.png?v=2',
    discount: 'Up to 30% off',
    description: 'Lighting & production gear',
  },
];
 
 export const PartnershipHero: React.FC = () => {
   return (
    <div className="relative mb-6 md:mb-8 overflow-hidden rounded-2xl border border-[#FFBF00]/20 bg-card">
       
       <div className="relative p-6 md:p-10">
         {/* Section header */}
         <div className="text-center mb-6 md:mb-8">
           <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-2">
             Official Partners
           </p>
           <h2 className="text-xl md:text-2xl font-black text-foreground mb-2">
             Exclusive Partner Pricing
           </h2>
           <p className="text-sm text-muted-foreground max-w-md mx-auto">
             Special discounts on cameras, lenses, lighting & production equipment
           </p>
         </div>
 
         {/* Partner logos - floating on gradient */}
         <div className="grid grid-cols-2 gap-6 md:gap-10 max-w-xl mx-auto">
           {partners.map((partner) => (
             <div
               key={partner.id}
               className="group flex flex-col items-center text-center py-4 transition-all duration-300 hover:scale-[1.03]"
             >
               {/* Logo - larger, with drop shadow for depth */}
               <div className="h-14 md:h-20 flex items-center justify-center mb-4 md:mb-5">
                 <img
                   src={partner.logo}
                   alt={partner.name}
                   className="h-full w-auto object-contain max-w-[120px] md:max-w-[160px] transition-all duration-300"
                 />
               </div>
               
                {/* Discount badge */}
               <Badge className="bg-gradient-to-r from-primary to-forge-gold text-primary-foreground border-0 font-black text-sm md:text-base px-4 py-1.5 mb-2">
                 {partner.discount}
               </Badge>
               
               {/* Description in muted color */}
               <p className="text-xs md:text-sm text-muted-foreground/80 leading-tight">
                 {partner.description}
               </p>
             </div>
           ))}
         </div>
       </div>
     </div>
   );
 };