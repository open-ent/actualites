import { CommentProvider } from '@open-ent/react/comments';
import { useCommentList } from '~/hooks/useCommentList';
import { Info } from '~/models/info';

const MAX_COMMENTS_WITHOUT_PAGINATION = 100;

export type CommentListProps = {
  /**
   * Comments to display in the card.
   */
  info: Info;
  withPagination?: boolean;
  forPrinting?: boolean;
};

export const CommentList = ({
  info,
  withPagination = true,
  forPrinting = false,
}: CommentListProps) => {
  const list = useCommentList(info);
  const { comments, callbacks, options, rights } = list;
  // `type` est réassigné plus bas (impression : lecture seule).
  let type = list.type;

  if (!withPagination)
    options.maxComments = options.additionalComments =
      MAX_COMMENTS_WITHOUT_PAGINATION;

  if (forPrinting) type = 'read';

  return (
    comments && (
      <CommentProvider
        type={type}
        callbacks={callbacks}
        comments={comments}
        options={options}
        rights={rights}
      />
    )
  );
};
