export type CommentAuthor = {
  id: string;
  name: string;
};

export type Comment = {
  id: string;
  ticketId: string;
  message: string;
  createdBy: CommentAuthor;
  createdAt: string;
};

export type CommentCreateInput = {
  message: string;
};
