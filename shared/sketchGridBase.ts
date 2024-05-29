export interface SketchGridItem {
  id: number;
  url_slug: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  image_cdnkey?: string;
}

export interface SketchGridData {
  sketches: SketchGridItem[];
  totalCount: number;
  totalPages: number;
}

export const SKETCH_PAGE_SIZE = 2;
