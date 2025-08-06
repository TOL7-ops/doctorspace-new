"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function TestSheet() {
  const [open, setOpen] = useState(false);

  console.log('🧪 TestSheet rendered, open:', open);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">
          Test Sheet
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px]">
        <SheetHeader>
          <SheetTitle>Test Sheet</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <p>This is a test sheet to verify the component is working.</p>
          <p>If you can see this, the Sheet component is working correctly!</p>
        </div>
      </SheetContent>
    </Sheet>
  );
} 