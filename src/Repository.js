import React from 'react';
import Issue from './Issue';
import ReactionList from './ReactionList';

const Repository = ({
    repository,
    onFetchMoreIssues,
    onStarRepository
}) => (
        <div>
            <p>
                <strong>In Repository:</strong>
                <a href={repository.url}>{repository.name}</a>
            </p>

            <button type="button" onClick={() =>
                onStarRepository(repository.id, repository.viewerHasStarred)
            }>
                {repository.viewerHasStarred ? 'Unstar' : 'Star'}
            </button>
            <ul>
                {repository.issues.edges.map(({ node }) => (
                    <React.Fragment key={node.id}>
                        <Issue issue={node} />
                        {(node.reactions) ? <ReactionList reactions={node.reactions} /> : undefined}
                    </React.Fragment>
                ))}
            </ul>

            <hr />
            <button onClick={onFetchMoreIssues} disabled={!repository.issues.pageInfo.hasNextPage}>More</button>

        </div>
    )

export default Repository;
