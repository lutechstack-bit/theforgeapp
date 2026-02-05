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
     <div className="relative mb-6 md:mb-8 overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary/10 via-card/80 to-card border border-primary/30 shadow-lg">
       {/* Enhanced decorative blur orbs */}
       <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
       <div className="absolute bottom-0 left-0 w-36 md:w-48 h-36 md:h-48 bg-primary/15 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
       <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-forge-gold/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
       
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
                   className="h-full w-auto object-contain max-w-[120px] md:max-w-[160px] drop-shadow-[0_0_15px_rgba(255,188,59,0.3)] group-hover:drop-shadow-[0_0_25px_rgba(255,188,59,0.5)] transition-all duration-300"
                 />
               </div>
               
               {/* Gold divider line */}
               <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent mb-4" />
               
               {/* Discount badge - more prominent */}
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