"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "react-hot-toast"

export function SettingsDialog() {
  const [open, setOpen] = React.useState(false)
  const [emailNotifs, setEmailNotifs] = React.useState(true)
  const [pushNotifs, setPushNotifs] = React.useState(false)
  const [dirty, setDirty] = React.useState(false)

  const save = async () => {
    // placeholder save
    toast.success("Settings saved")
    setDirty(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" aria-label="Open settings">Settings</Button>
      </DialogTrigger>
      <DialogContent aria-label="Settings dialog">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={emailNotifs} onChange={(e) => { setEmailNotifs(e.target.checked); setDirty(true) }} aria-label="Email notifications" />
              Email notifications
            </label>
          </div>
          <Separator />
          <div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={pushNotifs} onChange={(e) => { setPushNotifs(e.target.checked); setDirty(true) }} aria-label="Push notifications" />
              Push notifications
            </label>
          </div>
          <div className="pt-2">
            <Button onClick={save} disabled={!dirty} aria-disabled={!dirty} className="w-full">Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 