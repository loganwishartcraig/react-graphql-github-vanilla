import React from 'react';
import Issue from './Issue';

const IssueList = ({
    issues,
    onReactionButtonClick
}) => (

        <ul>
            {issues.edges.map(({ node }) => (
                <Issue
                    key={node.id}
                    issue={node}
                    onReactionButtonClick={onReactionButtonClick}
                />
            ))}
        </ul>

    );

export default IssueList;
