import { notFound } from '@tanstack/react-router'
import { projects } from '../data/portfolio'
import type { PortfolioProject } from '../data/portfolio'
import { supabase } from './supabase'

export async function loadPublicProject(slug: string): Promise<PortfolioProject> {
  const fallback = projects.find((project) => project.slug === slug)
  if (supabase) {
    const { data, error } = await supabase.from('projects')
      .select('slug,title,category,description,role,year,stack,image_url,image_alt,demo_url,repository_url,editorial,featured')
      .eq('slug', slug).eq('status', 'published').maybeSingle()
    if (!error) {
      if (!data) throw notFound()
      return {
        slug: data.slug,
        title: data.title,
        category: data.category as PortfolioProject['category'],
        description: data.description,
        role: data.role,
        year: data.year,
        stack: data.stack as string[],
        image: data.image_url,
        imageAlt: data.image_alt,
        href: data.repository_url,
        demoUrl: data.demo_url,
        editorial: data.editorial,
        featured: data.featured,
      }
    }
  }
  if (!fallback) throw notFound()
  return fallback
}
