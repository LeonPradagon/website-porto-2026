import { supabase } from './supabase'
import { defaultSiteSettings, type SiteSettings } from './site-settings'

const columns = 'role_id,role_en,hero_title_id,hero_title_en,hero_description_id,hero_description_en,about_id,about_en,seo_description_id,seo_description_en,contact_email,github_url,linkedin_url'

export async function loadPublicSiteSettings(): Promise<SiteSettings> {
  if (!supabase) return defaultSiteSettings
  const { data, error } = await supabase.from('site_settings').select(columns).eq('id', 1).maybeSingle()
  return !error && data ? data as SiteSettings : defaultSiteSettings
}
