import { supabase } from './supabase'
import { safeLog, isClient } from './utils'

export interface NotificationTemplate {
  id: string
  name: string
  title_template: string
  message_template: string
  notification_type: string
  priority: string
  is_active: boolean
}

// Cache for templates to avoid repeated database calls
let templateCache: NotificationTemplate[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Get all notification templates from the database
 */
export async function getNotificationTemplates(): Promise<NotificationTemplate[]> {
  if (!isClient) {
    safeLog.warn('getNotificationTemplates called during SSR, returning empty array');
    return [];
  }

  // Check cache first
  const now = Date.now();
  if (templateCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return templateCache;
  }

  try {
    const { data, error } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      safeLog.error('Error fetching notification templates:', error);
      return [];
    }

    // Update cache
    templateCache = data || [];
    cacheTimestamp = now;
    
    return templateCache;
  } catch (error) {
    safeLog.error('Error fetching notification templates:', error);
    return [];
  }
}

/**
 * Get a specific template by name
 */
export async function getTemplateByName(name: string): Promise<NotificationTemplate | null> {
  const templates = await getNotificationTemplates();
  return templates.find(t => t.name === name) || null;
}

/**
 * Get the default system alert template ID
 */
export async function getDefaultTemplateId(): Promise<string | null> {
  const systemTemplate = await getTemplateByName('system_alert');
  return systemTemplate?.id || null;
}

/**
 * Get template ID for appointment notifications
 */
export async function getAppointmentTemplateId(type: 'confirmed' | 'reminder' | 'cancelled' | 'rescheduled'): Promise<string | null> {
  const templateName = `appointment_${type}`;
  const template = await getTemplateByName(templateName);
  return template?.id || null;
}

/**
 * Get template ID for message notifications
 */
export async function getMessageTemplateId(): Promise<string | null> {
  const template = await getTemplateByName('new_message');
  return template?.id || null;
}

/**
 * Get template ID for urgent reminders
 */
export async function getUrgentReminderTemplateId(): Promise<string | null> {
  const template = await getTemplateByName('urgent_reminder');
  return template?.id || null;
}

/**
 * Clear the template cache (useful for testing or when templates are updated)
 */
export function clearTemplateCache(): void {
  templateCache = null;
  cacheTimestamp = 0;
}

/**
 * Ensure we have a valid template_id for notification creation
 */
export async function ensureTemplateId(templateId?: string | null, fallbackTemplate?: string): Promise<string | null> {
  // If template_id is provided and valid, use it
  if (templateId) {
    return templateId;
  }

  // If fallback template name is provided, try to get it
  if (fallbackTemplate) {
    const template = await getTemplateByName(fallbackTemplate);
    if (template) {
      return template.id;
    }
  }

  // Default to system_alert template
  return await getDefaultTemplateId();
} 