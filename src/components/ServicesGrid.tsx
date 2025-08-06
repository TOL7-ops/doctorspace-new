import React from 'react';
import { VideoCameraIcon, HomeIcon, PlusCircleIcon, BeakerIcon } from '@heroicons/react/24/outline';

const services = [
  {
    name: 'Video Visit',
    icon: VideoCameraIcon,
    href: '/video-visit',
  },
  {
    name: 'Home Visit',
    icon: HomeIcon,
    href: '/home-visit',
  },
  {
    name: 'Urgent Care',
    icon: PlusCircleIcon,
    href: '/urgent-care',
  },
  {
    name: 'Pharmacy',
    icon: BeakerIcon,
    href: '/pharmacy',
  },
];

export function ServicesGrid() {
  return (
    <div className="px-4 py-6">
      <h2 className="text-lg font-semibold mb-4">Services</h2>
      <div className="grid grid-cols-2 gap-4">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <a
              key={service.name}
              href={service.href}
              className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-xl space-y-2"
            >
              <Icon className="h-8 w-8 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">{service.name}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
} 