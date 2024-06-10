export interface SketchGridItem {
  id: number;
  url_slug: string;
  titleString: string;
  title: React.ReactNode;
  site_rating: number | null;
  subtitle?: React.ReactNode;
  image_cdnkey?: string;
  video_urls: string[];
}

export interface SketchGridData {
  sketches: SketchGridItem[];
  totalCount: number;
  totalPages: number;
}

export const SKETCH_PAGE_SIZE = 12; // Looks even 4x3 and 6x2

export const selectSketch = {
  id: true,
  url_slug: true,
  title: true,
  site_rating: true,
  video_urls: true,
  image: {
    select: {
      cdn_key: true,
    },
  },
  show: {
    select: {
      title: true,
      id: true,
      url_slug: true,
    },
  },
  season: {
    select: {
      year: true,
      id: true,
      url_slug: true,
    },
  },
};
