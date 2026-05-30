import { Button } from '@open-ent/react';
import { IconMessageInfo } from '@open-ent/react/icons';
import { StringUtils } from '@open-ent/utilities';
import clsx from 'clsx';

export interface CommentsCounterProps {
  /**
   * The number of comments to display.
   *
   */
  commentsCounter: number;
  /**
   * Optional click handler for the counter button.
   */
  onClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
  /**
   * Optional CSS class name to apply to the counter component.
   */
  className?: string;
}

const CommentsCounter = ({
  commentsCounter,
  onClick,
  className,
}: CommentsCounterProps) => {
  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onClick?.();
  };

  className = clsx('text-gray-700 fw-normal py-4 px-8 btn-icon', className);

  return (
    <div>
      <Button
        data-testid="info-view-comments-button"
        rightIcon={<IconMessageInfo />}
        variant="ghost"
        className={className}
        onClick={handleButtonClick}
      >
        {StringUtils.toCounter(commentsCounter)}
      </Button>
    </div>
  );
};

CommentsCounter.displayName = 'CommentsCounter';

export default CommentsCounter;
