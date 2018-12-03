import React from 'react';

const ReactionButton = ({
    subjectId,
    content,
    label,
    onReactionButtonClick
}) => (

        <button type="button" onClick={() => onReactionButtonClick(subjectId, content)}>
            {label}
        </button>

    );

export default ReactionButton;
