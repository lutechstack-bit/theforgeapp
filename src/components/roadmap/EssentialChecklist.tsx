import React from 'react';
import { 
  Shirt, Footprints, ShieldCheck, Droplets, Wrench,
  CreditCard, BatteryCharging, Droplet, NotebookPen, Glasses,
  Backpack, Pill, Sparkles, Bandage, Speaker, Flashlight,
  Laptop, HardDrive, Headphones, Mouse, Camera, Mic
} from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ChecklistItem {
  icon: React.ReactNode;
  name: string;
  optional?: boolean;
}

interface ChecklistSection {
  title: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
}

const checklistSections: ChecklistSection[] = [
  {
    title: 'Essential Clothing',
    icon: <Shirt className="w-5 h-5" />,
    items: [
      { icon: <Shirt />, name: 'Comfortable Clothes' },
      { icon: <Shirt />, name: 'Lightweight Clothing' },
      { icon: <ShieldCheck />, name: 'Durable Gloves (for equipment)' },
      { icon: <Footprints />, name: 'Running Shoes' },
      { icon: <Footprints />, name: 'Slippers' },
      { icon: <Shirt />, name: 'UV Arm Sleeves' },
    ],
  },
  {
    title: 'Essential Tools',
    icon: <Wrench className="w-5 h-5" />,
    items: [
      { icon: <CreditCard />, name: 'Valid ID Documents' },
      { icon: <CreditCard />, name: 'Cash In Hand' },
      { icon: <BatteryCharging />, name: 'Power Bank / Charger' },
      { icon: <Droplet />, name: 'Reusable Water Bottle' },
      { icon: <NotebookPen />, name: 'Notebooks & Pens' },
      { icon: <Glasses />, name: 'Caps & Sunglasses' },
      { icon: <Backpack />, name: 'Small Backpack' },
    ],
  },
  {
    title: 'Essential Care',
    icon: <Droplets className="w-5 h-5" />,
    items: [
      { icon: <Droplets />, name: 'Toiletries' },
      { icon: <Droplets />, name: 'Moisturizer' },
      { icon: <Droplets />, name: 'Sunscreen' },
      { icon: <Sparkles />, name: 'Insect Repellent' },
      { icon: <Droplets />, name: 'Wet Wipes / Hand Sanitizer' },
      { icon: <Sparkles />, name: 'Feminine Hygiene Products' },
      { icon: <Pill />, name: 'Personal Medication' },
      { icon: <Sparkles />, name: 'Masks', optional: true },
      { icon: <Bandage />, name: 'Balm / Band-Aids / Pain Reliever' },
      { icon: <Backpack />, name: 'Bags for Dirty/Wet Items' },
      { icon: <Sparkles />, name: 'Travel Neck Pillow / Blanket' },
      { icon: <Speaker />, name: 'Portable Bluetooth Speaker' },
      { icon: <Sparkles />, name: 'Energy Bars or Drinks' },
      { icon: <Flashlight />, name: 'Torch / Flashlight' },
      { icon: <Sparkles />, name: 'Hair Dryer' },
    ],
  },
  {
    title: 'For Filmmakers',
    icon: <Camera className="w-5 h-5" />,
    items: [
      { icon: <Laptop />, name: 'Laptop (editing capable)' },
      { icon: <HardDrive />, name: 'External Hard Drive (1TB+)' },
      { icon: <Headphones />, name: 'Headphones' },
      { icon: <Mouse />, name: 'Mouse' },
      { icon: <Camera />, name: 'Personal Camera', optional: true },
      { icon: <Mic />, name: 'Lapel Mic', optional: true },
    ],
  },
];

const EssentialChecklist: React.FC = () => {
  return (
    <div className="space-y-6 pb-8">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-foreground mb-2">What to Pack</h3>
        <p className="text-sm text-muted-foreground">
          Make sure you have everything ready for your Forge experience
        </p>
      </div>

      {checklistSections.map((section, sectionIndex) => (
        <Card key={sectionIndex} className="glass-card overflow-hidden">
          {/* Section Header */}
          <div className="flex items-center gap-3 p-4 border-b border-border/30 bg-secondary/30">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {section.icon}
            </div>
            <h4 className="font-semibold text-foreground">{section.title}</h4>
          </div>

          {/* Items Grid */}
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {section.items.map((item, itemIndex) => (
                <label 
                  key={itemIndex}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer group"
                >
                  <div className="w-5 h-5 rounded border-2 border-border group-hover:border-primary transition-colors flex items-center justify-center">
                    {/* Checkbox visual - can be made interactive if needed */}
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-muted-foreground w-4 h-4">
                      {React.cloneElement(item.icon as React.ReactElement, { className: 'w-4 h-4' })}
                    </span>
                    <span className="text-sm text-foreground">{item.name}</span>
                  </div>
                  {item.optional && (
                    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
                      Optional
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        </Card>
      ))}

      {/* Pro Tips */}
      <div className="p-4 rounded-xl gradient-subtle border border-primary/20">
        <h4 className="font-semibold text-foreground text-sm mb-2">💡 Pro Tips</h4>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• Pack light but pack smart - you'll be moving around a lot</li>
          <li>• Label your equipment and chargers clearly</li>
          <li>• Bring extra storage space for footage (minimum 500GB free)</li>
          <li>• Comfortable shoes are non-negotiable for shoot days</li>
        </ul>
      </div>
    </div>
  );
};

export default EssentialChecklist;