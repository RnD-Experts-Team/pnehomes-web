/**
 * Property Data Models and Type Definitions
 *
 * This module defines the core data structures for the property management system
 * using Zod schemas for runtime validation and TypeScript types for compile-time safety.
 *
 * The schemas ensure data integrity by validating incoming data from external sources
 * (JSON files, APIs, user input) and provide automatic type inference for TypeScript.
 */

// src/app/features/property/model/types.ts

import { z } from 'zod'

export const MediaTypeSchema = z.enum(['image', 'video']).nullable().optional()
export type MediaType = 'image' | 'video' | null

/**
 * Schema for the "What's Special" section of a property
 *
 * Contains marketing highlights and unique selling points:
 * @property {string[]} badges - Array of feature badges/tags (e.g., "New Construction", "Luxury")
 * @property {string} description - Detailed description of what makes this property special
 */
const WhatsSpecialSchema = z.object({
  badges: z.array(z.string()),
  description: z.string(),
})

/**
 * Schema for property facts and features sections
 *
 * Represents categorized lists of property features:
 * @property {string} title - Category title (e.g., "Interior Features", "Exterior Features")
 * @property {string[]} list - Array of specific features in this category
 */
const FactsFeatureSchema = z.object({
  title: z.string(),
  list: z.array(z.string()),
})



/**
 * Schema for property floor plan information
 *
 * Contains details about different floor plan options:
 * @property {string} title - Floor plan name/title (e.g., "The Madison", "Plan A")
 * @property {string} img - Image URL or path for the floor plan
 * @property {string} Description - Detailed description of the floor plan layout
 */
const FloorPlanSchema = z.object({
  title: z.string(),
  img: z.string(),
  img_type: MediaTypeSchema.default(null),
  Description: z.string(),
})

/**
 * TypeScript type for Contact information
 * Contains contact-related data and message templates
 */
export type Contact = {
  title: string
  message: string
}


/**
 * Main Property Schema
 *
 * Defines the complete structure of a property object with validation rules:
 *
 * @property {number} id - Unique numeric identifier for the property
 * @property {string} slug - URL-friendly unique identifier for routing
 * @property {string} title - Display name/title of the property
 * @property {string} community - Community or neighborhood name the floor plan can be built in
 * @property {string} price - Property price (stored as string to preserve formatting)
 * @property {string} beds - Number of bedrooms (string to handle "2+" format)
 * @property {string} baths - Number of bathrooms (string to handle "2.5" format)
 * @property {string} garages - Number of garage spaces (string for consistency)
 * @property {string} sqft - Square footage (string to preserve formatting like "2,500")
 * @property {string[]} gallery - Array of image URLs for the property gallery
 * @property {string} [zillow_link] - Optional link to Zillow listing
 * @property {WhatsSpecial} Whats_special - Marketing highlights and unique features
 * @property {FactsFeature[]} Facts_features - Categorized lists of property features
 * @property {FloorPlan[]} floor_plans - Available floor plan options
 */
export const PropertySchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  community: z.string(),
  price: z.string(),
  beds: z.string(),
  baths: z.string(),
  garages: z.string(),
  sqft: z.string(),
  gallery: z.array(z.string()).default([]),
  gallery_types: z.array(MediaTypeSchema).optional().default([]),
  zillow_link: z.string().optional().nullable(),
  Whats_special: WhatsSpecialSchema.optional().nullable(),
  Facts_features: z.array(FactsFeatureSchema).optional(),
  floor_plans: z.array(FloorPlanSchema).optional()
})



/**
 * Schema for the complete property data structure
 *
 * Contains the main data structure including title, cover, properties array, and contact info:
 * @property {string} title - Page title (e.g., "Floor Plans")
 * @property {string | null} cover - Cover image URL for the page (nullable)
 * @property {Property[]} properties - Array of property objects
 * @property {Contact} contact - Contact information and message templates
 */
// TypeScript type inference from Zod schemas
// These types are automatically generated and stay in sync with the schemas

/**
 * TypeScript type for a complete Property object
 * Inferred from PropertySchema for type safety
 */
export type Property = z.infer<typeof PropertySchema>

/**
 * TypeScript type for the What's Special section
 * Inferred from WhatsSpecialSchema
 */
export type WhatsSpecial = z.infer<typeof WhatsSpecialSchema>

/**
 * TypeScript type for Facts and Features sections
 * Inferred from FactsFeatureSchema
 */
export type FactsFeature = z.infer<typeof FactsFeatureSchema>

/**
 * TypeScript type for Floor Plan information
 * Inferred from FloorPlanSchema
 */
export type FloorPlan = z.infer<typeof FloorPlanSchema>

/**
 * TypeScript type for the complete Property Data structure
 * Contains the main data structure including title, cover, properties array, and contact info
 */
export type PropertyData = {
  title: string
  cover?: string | null // allow null/missing
  cover_type: MediaType
  properties: Property[]
  contact: Contact
}