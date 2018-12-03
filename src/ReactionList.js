import React from 'react';
import ReactionItem from './ReactionItem';

const ReactionList = ({
    reactions
}) => (
        <div>
            <ul>

                {
                    (reactions.edges.length)
                        ?
                        reactions.edges.map(({ node }) => (
                            <ReactionItem reaction={node} key={node.id} />
                        ))
                        :
                        <li>No Reactions</li>
                }

            </ul>
        </div>

    );

export default ReactionList;
