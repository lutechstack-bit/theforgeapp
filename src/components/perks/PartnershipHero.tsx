 import React from 'react';
 import { Badge } from '@/components/ui/badge';
 
 const partners = [
   {
     id: 'sony',
     name: 'Sony',
     logo: '/images/brands/sony.png',
     discount: 'Up to 25% off',
     description: 'Cameras, lenses & accessories',
   },
   {
     id: 'digitek',
     name: 'Digitek',
     logo: '/images/brands/digitek.png',
     discount: 'Up to 30% off',
     description: 'Lighting & production gear',
   },
 ];
 
 export const PartnershipHero: React.FC = () => {
   return (
     <div className="relative mb-6 md:mb-8 overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20">
       {/* Decorative blur orbs */}
       <div className="absolute top-0 right-0 w-40 md:w-56 h-40 md:h-56 bg-primary/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
       <div className="absolute bottom-0 left-0 w-28 md:w-40 h-28 md:h-40 bg-primary/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
       
       <div className="relative p-5 md:p-8">
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
 
         {/* Partner cards */}
         <div className="grid grid-cols-2 gap-3 md:gap-5 max-w-lg mx-auto">
           {partners.map((partner) => (
             <div
               key={partner.id}
               className="group relative bg-white rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col items-center text-center hover:shadow-gold-glow transition-all duration-300 hover:scale-[1.02]"
             >
               {/* Logo */}
               <div className="h-10 md:h-14 flex items-center justify-center mb-3 md:mb-4">
                 <img
                   src={partner.logo}
                   alt={partner.name}
                   className="h-full w-auto object-contain max-w-[100px] md:max-w-[140px]"
                 />
               </div>
               
               {/* Divider */}
               <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-3" />
               
               {/* Discount badge */}
               <Badge className="bg-gradient-to-r from-primary to-deep-gold text-primary-foreground border-0 font-bold text-xs md:text-sm px-3 py-1">
                 {partner.discount}
               </Badge>
               
               {/* Description */}
               <p className="text-[10px] md:text-xs text-gray-500 mt-2 leading-tight">
                 {partner.description}
               </p>
             </div>
           ))}
         </div>
       </div>
     </div>
   );
 };