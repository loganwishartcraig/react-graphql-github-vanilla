import React from "react";
import ReactionButton from "./ReactionButton";

const reactionContent = [{
    content: 'THUMBS_UP',
    label: 'Thumbs Up'
}, {
    content: 'THUMBS_DOWN',
    label: 'Thumbs Down'
}, {
    content: 'LAUGH',
    label: 'Laugh'
}, {
    content: 'HOORAY',
    label: 'Hooray'
}, {
    content: 'CONFUSED',
    label: 'Confused'
}, {
    content: 'HEART',
    label: 'Heart'
}];

const ReactionCreator = ({
    subjectId,
    onReactionButtonClick
}) => (
        <menu type="toolbar">

            {reactionContent.map(reactionItem => (
                <li key={reactionItem.content}>
                    <ReactionButton
                        subjectId={subjectId}
                        content={reactionItem.content}
                        label={reactionItem.label}
                        onReactionButtonClick={onReactionButtonClick}
                    ></ReactionButton>
                </li>
            ))}

        </menu>
    );

export default ReactionCreator;
