import { z } from "zod";

export const HateoasLinkSchema = z.object({
  rel: z.string(),
  href: z.string(),
  method: z.string().optional(),
  title: z.string().optional(),
  schema: z.string().optional(),
});
export type HateoasLink = z.infer<typeof HateoasLinkSchema>;

export const HateoasActionSchema = z.object({
  rel: z.string(),
  href: z.string(),
  method: z.string(),
  title: z.string().optional(),
  schema: z.string().optional(),
  body: z.record(z.string(), z.unknown()).optional(),
  disabled: z.boolean().optional(),
  disabledReason: z.union([z.string(), z.array(z.string())]).optional(),
});
export type HateoasAction = z.infer<typeof HateoasActionSchema>;

export const HateoasLinkTemplateSchema = z.object({
  rel: z.string(),
  hrefTemplate: z.string(),
  title: z.string().optional(),
});
export type HateoasLinkTemplate = z.infer<typeof HateoasLinkTemplateSchema>;

export const HateoasActionTemplateSchema = z.object({
  rel: z.string(),
  hrefTemplate: z.string(),
  method: z.string(),
  title: z.string().optional(),
  schema: z.string().optional(),
  body: z.record(z.string(), z.unknown()).optional(),
  disabled: z.boolean().optional(),
  disabledReason: z.union([z.string(), z.array(z.string())]).optional(),
});
export type HateoasActionTemplate = z.infer<typeof HateoasActionTemplateSchema>;

export const HateoasLinksSchema = z.object({
  _links: z.array(HateoasLinkSchema).optional(),
  _actions: z.array(HateoasActionSchema).optional(),
  _linkTemplates: z.array(HateoasLinkTemplateSchema).optional(),
  _actionTemplates: z.array(HateoasActionTemplateSchema).optional(),
});
export type HateoasLinks = z.infer<typeof HateoasLinksSchema>;
