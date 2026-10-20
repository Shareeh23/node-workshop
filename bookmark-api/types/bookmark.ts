export type BookMark = {
  id: string;
  title: string;
  url: string;
  category: string;
  createdAt: string;
};

export type BookMarkInput = {
  title: string;
  url: string;
  category: string;
};