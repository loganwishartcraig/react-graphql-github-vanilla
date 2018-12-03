import React from 'react';
import ReactionItem from './ReactionItem';


const ReactionList = ({ reactions }) => (

    <ul>

        {
            (reactions.edges.length)
                ?
                reactions.edges.map(({ node }) => (<ReactionItem reaction={node} key={node.id} />))
                :
                <li>No Reactions</li>
        }

    </ul>

);

export default ReactionList;
