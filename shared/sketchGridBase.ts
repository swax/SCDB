export interface SketchGridItem {
  id: number;
  url_slug: string;
  title: string;
  subtitle?: string;
  image_cdnkey?: string;
}

export interface SketchGridData {
  sketches: SketchGridItem[];
  totalCount: number;
  totalPages: number;
}

export const SKETCH_PAGE_SIZE = 9;
