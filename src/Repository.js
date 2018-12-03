import React from 'react';
import IssueList from './IssueList';

const Repository = ({
    repository,
    onFetchMoreIssues,
    onStarRepository,
    onReactionButtonClick
}) => (
        <div>
            <p>
                <strong>In Repository:</strong>
                <a href={repository.url}>{repository.name}</a>
            </p>

            <button type="button" onClick={() =>
                onStarRepository(repository.id, repository.viewerHasStarred)
            }>
                {repository.stargazers.totalCount}
                {repository.viewerHasStarred ? ' Unstar' : ' Star'}
            </button>

            <IssueList issues={repository.issues} onReactionButtonClick={onReactionButtonClick} />

            <hr />
            <button onClick={onFetchMoreIssues} disabled={!repository.issues.pageInfo.hasNextPage}>More</button>

        </div>
    );

export default Repository;
