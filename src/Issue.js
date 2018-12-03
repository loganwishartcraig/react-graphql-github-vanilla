import React from 'react';
import ReactionList from './ReactionList';
import ReactionCreator from './ReactionCreator';

const Issue = ({
    issue: {
        id,
        url,
        title,
        reactions
    },
    onReactionButtonClick
}) => (
        <li>
            <a href={url}>{title}</a>
            {(reactions) ? <ReactionList reactions={reactions} /> : undefined}
            <ReactionCreator subjectId={id} onReactionButtonClick={onReactionButtonClick} />
        </li>
    );

export default Issue;
