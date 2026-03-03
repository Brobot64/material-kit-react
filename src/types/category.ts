export type Category = {
  _id: string;
  name: string;
  description?: string;
  parentId?: string;
  businessId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
