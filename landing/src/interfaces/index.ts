export interface IMenuItem {
  id: string;
  title: string;
  url: string;
  isExternal?: boolean;
}

export interface IFooterLink {
  id: string;
  label: string;
  url: string;
  isExternal?: boolean;
  description?: string;
}

export interface IFooterSection {
  id: string;
  title: string;
  links: IFooterLink[];
}